//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IReflectionFarmingBalanceAdder.sol";

// import "hardhat/console.sol";

/// @title BalanceAdderV3
/// @author Anton Davydov - <fetsorn@gmail.com>
contract ReflectionFarmingBalanceAdder is IReflectionFarmingBalanceAdder {
    address public owner;
    address[] public stakingWeightUpdator;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }
    
    modifier isStakingWeightUpdator() {
        bool found = false;
        for (uint i = 0; i < stakingWeightUpdator.length; i++) {
            if (stakingWeightUpdator[i] == msg.sender) {
                found = true;
                break;
            }
        }
        require(found, "ACW");
        _;
    }

    IBalanceKeeperV2 public balanceKeeper;
    ILPKeeperV2 public lpKeeper;
    IFarm public farm;

    mapping(bytes => uint256) public impact;
    uint256 public totalImpact;

    uint256 public lastPortion;
    uint256 public totalUnlocked;
    uint256 public currentPortion;
    uint256 public currentLPIndex;
    uint256 public currentUserIndex;
    bool public isProcessing;

    mapping(address => bool) public canRoute;

    constructor(
        IBalanceKeeperV2 _balanceKeeper,
        ILPKeeperV2 _lpKeeper,
        IFarm _farm
    ) {
        owner = msg.sender;
        balanceKeeper = _balanceKeeper;
        lpKeeper = _lpKeeper;
        farm = _farm;
    }

    function setOwner(address _owner) external isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setFarm(IFarm _farm) external isOwner {
        IFarm farmOld = farm;
        farm = _farm;
        emit SetFarm(farmOld, _farm);
    }

    function setCanRoute(address parser, bool _canRoute) external isOwner {
        canRoute[parser] = _canRoute;
        emit SetCanRoute(msg.sender, parser, _canRoute);
    }

    function setImpact(bytes calldata token, uint256 _impact) public {
        require(canRoute[msg.sender] || msg.sender == address(this), "ACR");
        require(!isProcessing, "BA1");
        totalImpact -= impact[token];
        impact[token] = _impact;
        totalImpact += _impact;
        emit SetImpact(token, _impact, totalImpact);
    }

    function deserializeUint(
        bytes memory b,
        uint256 startPos,
        uint256 len
    ) public pure returns (uint256) {
        uint256 v = 0;
        for (uint256 p = startPos; p < startPos + len; p++) {
            v = v * 256 + uint256(uint8(b[p]));
        }
        return v;
    }

    function deserializeAddress(bytes memory b, uint256 startPos)
        public
        pure
        returns (address)
    {
        return address(uint160(deserializeUint(b, startPos, 20)));
    }

    function totalBalance() external view returns (uint256) {
        return balanceKeeper.totalBalance();
    }
    
    uint256 stakingModifier = 1;
    uint256 cacheStakingModifier = 1;
    uint256 stakingImpact;
    uint256 totalLPKeeperTokensCache;
    function updateStakeModifier(uint _stakingModifier) public isStakingWeightUpdator {
        cacheStakingModifier = _stakingModifier;
    }
    
    function updateStakeImpact() private {
        totalImpact -= stakingImpact;
        stakingImpact = stakingImpact * cacheStakingModifier / stakingModifier;
        totalImpact += stakingImpact;
        stakingModifier = cacheStakingModifier;
    }

    function processBalances(uint256 step, uint256 port_portions) external {
        if (totalImpact == 0) {
            return;
        }
        
        while (step > 0) {
            
            // if all processed - go to first farm (max + 1 is staking index)
            if (currentLPIndex == totalLPKeeperTokensCache + 1) {
                currentLPIndex = 0;
                continue;
            }
            
            //if at start of loop, get new portion
            if (currentLPIndex == 0) {
                totalLPKeeperTokensCache = lpKeeper.totalTokens();
                totalUnlocked = farm.totalUnlocked();
                currentPortion = totalUnlocked - lastPortion;
                updateStakeImpact();
            }
            
            //get token allocation data 
            uint CurImpact;
            if (currentLPIndex == totalLPKeeperTokensCache) {
                CurImpact = stakingImpact;
            } else {
                bytes memory tokenAddress = lpKeeper.tokenAddressById(currentLPIndex);
                CurImpact = impact[tokenAddress];
            }
            uint256 allocation = (currentPortion * CurImpact) /
                totalImpact;
            if (allocation == 0) {
                return;
            }
            
            // updating step (mutable) dividing things for next farm iteration
            // depends also on lp index, if max+1 then we run staking
            uint256 userIndexFrom = currentUserIndex;
            uint256 userIndexTo;
            uint256 totalUsersOnCurrentIndex;
            
            if (currentLPIndex == totalLPKeeperTokensCache) {
                totalUsersOnCurrentIndex = balanceKeeper.totalUsers();
            } else  {
                totalUsersOnCurrentIndex = lpKeeper.totalTokenUsers(currentLPIndex);     
            }

            if (totalUsersOnCurrentIndex < userIndexTo + step) {
                userIndexTo = totalUsersOnCurrentIndex;
                step -= totalUsersOnCurrentIndex - userIndexFrom;
            } else {
                userIndexTo = userIndexFrom + step;
            }   
            
            for (
                uint256 userIndex = userIndexFrom;
                userIndex < userIndexTo;
                userIndex++
            ) {
                if (currentLPIndex == totalLPKeeperTokensCache) {
                    uint256 add = (allocation * balanceKeeper.balance(userIndex)) /
                        lpKeeper.totalBalance(currentLPIndex);
                    balanceKeeper.add(userIndex, add);
                    emit ProcessBalance(currentLPIndex, abi.encodePacked(balanceKeeper), farm, userIndex, add);
                } else {
                    uint256 userId = lpKeeper.tokenUser(currentLPIndex, userIndex);
                    uint256 add = (allocation * lpKeeper.balance(currentLPIndex, userId)) /
                        lpKeeper.totalBalance(currentLPIndex);
                    balanceKeeper.add(userId, add);
                    emit ProcessBalance(currentLPIndex, lpKeeper.tokenAddressById(currentLPIndex), farm, userId, add);
                }
            }
            
            lastPortion += currentPortion;
            currentLPIndex += 1;
            emit ProcessBalances(farm, step);
            
        }
    }
}
