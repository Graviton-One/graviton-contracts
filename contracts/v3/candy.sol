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
    function updaterReward(address farm) external;
    function pendingReward(address farm) external view returns(uint);
    function takeFromFarming(address farm, uint amount) external;
    function getFarmingApprove(address pool) external returns (address addr);
}

contract CanToken {
    
    struct TokenData {
        uint providedAmount;
        uint lpAmount;
        uint rewardDebt;
    }
    
    // user address -> farm address -> token Info
    mapping (address => mapping (address => TokenData)) users;
    
    function mintFor(address _user, address _farm, uint _providedAmount, uint _lpAmount, uint _rewardDebt) public{
        TokenData memory userTokenData = users[_user][_farm];
        
        userTokenData.providedAmount += _providedAmount;
        userTokenData.lpAmount += _providedAmount;
        userTokenData.rewardDebt = 0;
    }
    
    function burnFor(address _user, address _farm, uint _burnAmount) public returns (uint lpAmount, uint rewardDebt) {
        TokenData memory userTokenData = users[_user][_farm];
        userTokenData.providedAmount -= _burnAmount;
        userTokenData.lpAmount -= userTokenData.lpAmount * userTokenData.providedAmount / _burnAmount;
        userTokenData.rewardDebt = 0;
    }
    
}

contract CandyShop {
    address public owner;
    IPoolProxy public poolProxy;
    IFarmProxy public farmProxy;
    CanToken public canToken;

    constructor(
        IPoolProxy _poolProxy,
        IFarmProxy _farmProxy,
        CanToken _canToken,
        address _owner
    ) {
        poolProxy = _poolProxy;
        farmProxy = _farmProxy;
        CanToken = _canToken;
        owner = _owner;
    }
    
    // owner control functions
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function transferOwnership(address _owner) public isOwner {
        owner = _owner;
    }
    
    function depositTokenFor(
            address _user,
            uint _firstTokenAmount, 
            address _pool
    ) public {
        // get pool infor and gton amount 
        (address firstTokenAddress, address secondTokenAddress, address lp) = poolProxy.getPoolTokens(_pool);
        uint secondTokenAmount = poolProxy.getGtonAmountForAddLiquidity(_pool,_firstTokenAmount);
        // approve tokens for liquidity
        require(IERC20(firstTokenAddress).transferFrom(_user,address(this),_firstTokenAmount),"not enough");
        
        address approveAddress = poolProxy.getAddLiquidityApprove();
        require(IERC20(firstTokenAddress).approve(approveAddress,_firstTokenAmount),"not enough");
        require(IERC20(secondTokenAddress).approve(approveAddress,secondTokenAmount),"not enough");
        // send liquidity and get lp amount
        uint lpAmount = poolProxy.addLiquidity(
            _pool,
            _firstTokenAmount,
            secondTokenAmount
        );

        //mint tokens
        
        // send lp tokens to farming
        require(IERC20(lp).approve(address(routerProxy),lpAmount),"not enough"); 
        routerProxy.sendToFarming(_pool, lpAmount);
        usersDeposits[farmId][_user] += _amount;
        totalDeposits[farmId] += _amount;
    }


    // lp token amount should be calculated
    function withdrawTokenFor(
            address _user, 
            uint _lpAmount, 
            address _pool, 
            uint _expectedTokenAmount
    ) public {
        (address firstTokenAddress, address secondTokenAddress, address lp) = routerProxy.getPoolTokens(_pool);
        require(firstTokenAddress==gton,'lol');
        uint farmId = staker.farmId(lp);
        staker.withdrawFor(farmId,_lpAmount,_user);
        routerProxy.getFromFarming(_pool,_lpAmount);
        (, uint amountSecond) = routerProxy.removeLiquidity(_lpAmount,_pool);
        require(amountSecond < _expectedTokenAmount,'lol');
        require(IERC20(secondTokenAddress).transfer(_user,amountSecond),'lol');
        usersDeposits[farmId][_user] -= amountSecond;
        totalDeposits[farmId] -= amountSecond;
    }
    
    function claim(uint _farmId, address _user) public {
        staker.claimFor(_farmId,_user);
    }
    
}
