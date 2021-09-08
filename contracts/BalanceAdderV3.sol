//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IBalanceAdderV3.sol";

// import "hardhat/console.sol";

/// @title BalanceAdderV3
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderV3 is IBalanceAdderV3 {
    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    IBalanceKeeperV2 public balanceKeeper;
    ILPKeeperV2 public lpKeeper;
    IFarm public farm;

    mapping(address => uint256) public impact;
    uint256 public totalImpact;

    uint256 public lastPortion;
    uint256 public totalUnlocked;
    uint256 public currentPortion;
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

    function setImpact(address token, uint256 _impact) public {
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

    uint256 MAX_INT = type(uint256).max;
    uint256 stakingModifier = 1;

    function processBalances(uint256 step) external {
        if (totalImpact == 0) {
            return;
        }

        // TODO: if at start of loop, get new portion
        if (true) {
            totalUnlocked = farm.totalUnlocked();
            currentPortion = totalUnlocked - lastPortion;
        }

        // TODO: if at start of loop, distribute staking
        // gas savings
        uint256 totalBalance = 1;
        balanceKeeper.add(0, 1);
        // console.log("totalBalance", balanceKeeper.totalBalance());
        if (totalBalance > 0) {
            uint256 _impact = totalBalance * stakingModifier;
            setImpact(address(balanceKeeper), _impact);
            uint256 allocation = (currentPortion * _impact) / totalImpact;
            // console.log(
            //     totalBalance,
            //     _impact,
            //     allocation,
            //     balanceKeeper.totalUsers()
            // );
            for (
                uint256 userId = 0;
                userId < balanceKeeper.totalUsers();
                userId++
            ) {
                uint256 add = (allocation * balanceKeeper.balance(userId)) /
                    balanceKeeper.totalBalance();
                balanceKeeper.add(userId, add);
                // console.log(MAX_INT, address(balanceKeeper), address(farm));
                // console.log(address(farm), userId, add);
                emit ProcessBalance(
                    MAX_INT,
                    address(balanceKeeper),
                    farm,
                    userId,
                    add
                );
            }
        }

        for (uint256 tokenId = 0; tokenId < lpKeeper.totalTokens(); tokenId++) {
            address tokenAddress = deserializeAddress(
                lpKeeper.tokenAddressById(tokenId),
                0
            );
            uint256 allocation = (currentPortion * impact[tokenAddress]) /
                totalImpact;
            if (allocation == 0) {
                return;
            }
            for (
                uint256 userIndex = 0;
                userIndex < lpKeeper.totalTokenUsers(tokenId);
                userIndex++
            ) {
                uint256 userId = lpKeeper.tokenUser(tokenId, userIndex);
                uint256 add = (allocation * lpKeeper.balance(tokenId, userId)) /
                    lpKeeper.totalBalance(tokenId);
                balanceKeeper.add(userId, add);
                // console.log(tokenId, tokenAddress, address(farm));
                // console.log(address(farm), userId, add);
                emit ProcessBalance(tokenId, tokenAddress, farm, userId, add);
            }
        }

        // TODO: update lastPortion if finished

        emit ProcessBalances(farm, step);
    }
}
