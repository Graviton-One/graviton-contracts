//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IERC20.sol";

interface IPoolProxy {
    function addLiquidity(address pool,uint gtonAmount,uint secondTokenAmount) external returns (uint liquidity);
    function removeLiquidity(uint lpTokenAmount,address pool) external returns (uint amountFirst, uint amountSecond);
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
        address pool;
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
    function mintFor(address _user, uint _can_id, uint _providedAmount) public {
        // getting user and stack info from mappings
        UserTokenData memory userTokenData = usersInfo[_can_id][_user];
        CanData memory canData = canInfo[_can_id];
        updateCan(_can_id);
        
        // get pool infor and gton amount 
        (address firstTokenAddress, address secondTokenAddress, address lp) = canData.poolProxy.getPoolTokens(canData.pool);
        uint secondTokenAmount = canData.poolProxy.getGtonAmountForAddLiquidity(canData.pool,_providedAmount);
        // approve tokens for liquidity
        require(IERC20(firstTokenAddress).transferFrom(_user,address(this),_providedAmount),"not enough");
        
        address approveAddress = canData.poolProxy.getAddLiquidityApprove(canData.pool);
        require(IERC20(firstTokenAddress).approve(approveAddress,_providedAmount),"not enough");
        require(IERC20(secondTokenAddress).approve(approveAddress,secondTokenAmount),"not enough");
        // send liquidity and get lp amount
        uint lpAmount = canData.poolProxy.addLiquidity(
            canData.pool,
            _providedAmount,
            secondTokenAmount
        );
        
        // send lp tokens to farming
        require(IERC20(lp).approve(address(canData.farmProxy),lpAmount),"not enough"); 
        canData.farmProxy.sendToFarming(canData.pool, lpAmount);
    
        // previous pending reward goes to aggregated reward
        userTokenData.aggregatedReward = lpAmount * canData.accRewardPerShare / 1e12 - userTokenData.rewardDebt;
        // incrementing provided and lp amount
        userTokenData.providedAmount += _providedAmount;
        userTokenData.lpAmount += lpAmount;
        // updating reward reward debt
        userTokenData.rewardDebt = userTokenData.lpAmount * canData.accRewardPerShare / 1e12;
        
        canData.totalProvidedTokenAmount += lpAmount;
    }
    
    
    // creates some can tokens for user in declared stack
    function burnFor(address _user, uint _can_id, uint _providedAmount, uint _rewardAmount) public {
        // getting user and stack info from mappings
        UserTokenData memory userTokenData = usersInfo[_can_id][_user];
        CanData memory canData = canInfo[_can_id];
        updateCan(_can_id);
        
        // calculate lp amount
        require(_providedAmount <= userTokenData.providedAmount, "insufficent amount");
        uint lpAmount = _providedAmount * userTokenData.lpAmount / userTokenData.providedAmount;
        
        (address firstTokenAddress,,) = canData.poolProxy.getPoolTokens(canData.pool);

        canData.farmProxy.takeFromFarming(canData.pool,lpAmount);
        (uint amountFirst,) = canData.poolProxy.removeLiquidity(lpAmount,canData.pool);
        require(IERC20(firstTokenAddress).transfer(_user,amountFirst),'lol');


        // previous pending reward goes to aggregated reward
        userTokenData.aggregatedReward += lpAmount * canData.accRewardPerShare / 1e12 - userTokenData.rewardDebt;
        require(_rewardAmount <= userTokenData.aggregatedReward, "insufficent amount");
        require(canData.rewardToken.transfer(_user,_rewardAmount),'lol');
        
        // decrementing provided and lp amount and aggregatedReward
        userTokenData.aggregatedReward -= _rewardAmount;
        userTokenData.providedAmount -= _providedAmount;
        userTokenData.lpAmount -= lpAmount;
        // updating reward reward debt
        userTokenData.rewardDebt = userTokenData.lpAmount * canData.accRewardPerShare / 1e12;
        
        canData.totalProvidedTokenAmount -= lpAmount;
    }
    
}
