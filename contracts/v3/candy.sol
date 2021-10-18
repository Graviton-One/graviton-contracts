//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IERC20.sol";

interface IPoolProxy {
    function addLiquidity(address pool,uint gtonAmount,uint secondTokenAmount) external returns (uint liquidity);
    function removeLiquidity(uint lpTokenAmount,address pool) external returns (uint amountGton, uint amountSecond);
    function getGtonAmountForAddLiquidity(address _pool,uint secondTokenAmount) external view returns (uint gtonAmount);
    function getPoolTokens(address pool) external returns (address firstToken, address secondToken, address lp);
    function getAddLiquidityApprove(address pool) external returns (address addr);
}

interface IFarmProxy {
    function sendToFarming(address farm, uint amount) external;
    function claimReward(address farm, uint farmId) external returns(uint);
    function pendingReward(address farm) external view returns(uint);
    function takeFromFarming(address farm, uint amount) external;
    function getFarmingApprove(address pool) external returns (address addr);
}

contract CandyShop {
    
    struct UserTokenData {
        uint providedAmount;
        uint lpAmount;
        uint rewardDebt;
        uint aggregatedReward;
    }
    
    struct CanData {
        uint totalProvidedTokenAmount;
        uint accRewardPerShare;
        uint totalRewardsClaimed;
        address farmAddress;
        uint farmId;
        IFarmProxy farmProxy;
        IPoolProxy poolProxy;
        IERC20 lpToken;
        IERC20 providingToken;
        IERC20 rewardToken;
    }
    
    mapping (uint => CanData) public canInfo;
    mapping (uint => mapping (address => UserTokenData)) public usersInfo;
    uint public lastStackId;
    
    function updateCan (uint _can_id) public {
        
        CanData memory canData = canInfo[_can_id];
        uint newPortion = (canData.farmProxy.claimReward(canData.farmAddress,canData.farmId) - canData.totalRewardsClaimed);
        canData.accRewardPerShare += newPortion * 1e12 / canData.totalProvidedTokenAmount;
        
    }

    // creates some can tokens for user in declared stack
    function mintFor(address _user, uint _can_id, uint _providedAmount, uint _lpAmount) public {
        // getting user and stack info from mappings
        UserTokenData memory userTokenData = usersInfo[_can_id][_user];
        CanData memory canData = canInfo[_can_id];
        updateCan(_can_id);
    
        // previous pending reward goes to aggregated reward
        userTokenData.aggregatedReward = _lpAmount * canData.accRewardPerShare / 1e12 - userTokenData.rewardDebt;
        // incrementing provided and lp amount
        userTokenData.providedAmount += _providedAmount;
        userTokenData.lpAmount += _lpAmount;
        // updating reward reward debt
        userTokenData.rewardDebt = userTokenData.lpAmount * canData.accRewardPerShare / 1e12;
        
        canData.totalProvidedTokenAmount += _lpAmount;
    }
    
    
    // creates some can tokens for user in declared stack
    function burnFor(address _user, uint _can_id, uint _providedAmount, uint _rewardAmount) public {
        // getting user and stack info from mappings
        UserTokenData memory userTokenData = usersInfo[_can_id][_user];
        CanData memory canData = canInfo[_can_id];
        updateCan(_can_id);
        
        require(_providedAmount <= userTokenData.providedAmount, "insufficent amount");
        uint lpAmount = _providedAmount * userTokenData.lpAmount / userTokenData.providedAmount;
    
        // previous pending reward goes to aggregated reward
        userTokenData.aggregatedReward += lpAmount * canData.accRewardPerShare / 1e12 - userTokenData.rewardDebt;
        require(_rewardAmount <= userTokenData.aggregatedReward, "insufficent amount");
        
        // decrementing provided and lp amount and aggregatedReward
        userTokenData.aggregatedReward -= _rewardAmount;
        userTokenData.providedAmount -= _providedAmount;
        userTokenData.lpAmount -= lpAmount;
        // updating reward reward debt
        userTokenData.rewardDebt = userTokenData.lpAmount * canData.accRewardPerShare / 1e12;
        
        canData.totalProvidedTokenAmount -= lpAmount;
    }
    
}

// contract CandyShop1 {
//     address public owner;
//     IPoolProxy public poolProxy;
//     IFarmProxy public farmProxy;

//     constructor(
//         IPoolProxy _poolProxy,
//         IFarmProxy _farmProxy,
//         CanToken _canToken,
//         address _owner
//     ) {
//         poolProxy = _poolProxy;
//         farmProxy = _farmProxy;
//         CanToken = _canToken;
//         owner = _owner;
//     }
    
//     // owner control functions
//     modifier isOwner() {
//         require(msg.sender == owner, "Caller is not owner");
//         _;
//     }

//     function transferOwnership(address _owner) public isOwner {
//         owner = _owner;
//     }
    
//     function depositTokenFor(
//             address _user,
//             uint _firstTokenAmount, 
//             address _pool
//     ) public {
//         // get pool infor and gton amount 
//         (address firstTokenAddress, address secondTokenAddress, address lp) = poolProxy.getPoolTokens(_pool);
//         uint secondTokenAmount = poolProxy.getGtonAmountForAddLiquidity(_pool,_firstTokenAmount);
//         // approve tokens for liquidity
//         require(IERC20(firstTokenAddress).transferFrom(_user,address(this),_firstTokenAmount),"not enough");
        
//         address approveAddress = poolProxy.getAddLiquidityApprove();
//         require(IERC20(firstTokenAddress).approve(approveAddress,_firstTokenAmount),"not enough");
//         require(IERC20(secondTokenAddress).approve(approveAddress,secondTokenAmount),"not enough");
//         // send liquidity and get lp amount
//         uint lpAmount = poolProxy.addLiquidity(
//             _pool,
//             _firstTokenAmount,
//             secondTokenAmount
//         );

//         //mint tokens
        
//         // send lp tokens to farming
//         require(IERC20(lp).approve(address(routerProxy),lpAmount),"not enough"); 
//         routerProxy.sendToFarming(_pool, lpAmount);
//         usersDeposits[farmId][_user] += _amount;
//         totalDeposits[farmId] += _amount;
//     }


//     // lp token amount should be calculated
//     function withdrawTokenFor(
//             address _user, 
//             uint _lpAmount, 
//             address _pool, 
//             uint _expectedTokenAmount
//     ) public {
//         (address firstTokenAddress, address secondTokenAddress, address lp) = routerProxy.getPoolTokens(_pool);
//         require(firstTokenAddress==gton,'lol');
//         uint farmId = staker.farmId(lp);
//         staker.withdrawFor(farmId,_lpAmount,_user);
//         routerProxy.getFromFarming(_pool,_lpAmount);
//         (, uint amountSecond) = routerProxy.removeLiquidity(_lpAmount,_pool);
//         require(amountSecond < _expectedTokenAmount,'lol');
//         require(IERC20(secondTokenAddress).transfer(_user,amountSecond),'lol');
//         usersDeposits[farmId][_user] -= amountSecond;
//         totalDeposits[farmId] -= amountSecond;
//     }
    
//     function claim(uint _farmId, address _user) public {
//         staker.claimFor(_farmId,_user);
//     }
    
// }
