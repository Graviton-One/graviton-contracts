//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IERC20.sol";
import "./staker.sol";

interface IUniswapV2Router {
    function addLiquidity(address pool,uint gtonAmount,uint secondTokenAmount) external returns (uint liquidity);
    function removeLiquidity(uint lpTokenAmount,address pool) external returns (uint amountGton, uint amountSecond);
    function getGtonAmountForAddLiquidity(address _pool,uint secondTokenAmount) external view returns (uint gtonAmount);
    function getPoolTokens(address pool) external returns (address firstToken, address secondToken, address lp);
    function sendToFarming(address pool, uint amount) external;
    function getFromFarming(address pool, uint amount) external;
}

contract CandyShop {
    address public owner;
    IUniswapV2Router public routerProxy;
    Staker public staker;
    address public gton;

    constructor(
        IUniswapV2Router _routerProxy,
        address _owner,
        Staker _staker,
        address _gton
    ) {
        gton = _gton;
        routerProxy = _routerProxy;
        owner = _owner;
        staker = _staker;
    }

    // farm id -> user address -> deposited amount
    mapping(uint256 => mapping (address => uint256)) public usersDeposits;
    mapping(uint256 => uint) public totalDeposits;
    mapping(uint256 => bool) public allowedFarms;

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
            uint _amount, 
            address _pool
    ) public {
        // get pool infor and gton amount 
        (address firstTokenAddress, address secondTokenAddress, address lp) = routerProxy.getPoolTokens(_pool);
        require(firstTokenAddress==gton,'lol');
        uint gtonAmount = routerProxy.getGtonAmountForAddLiquidity(_pool,_amount);
        // approve tokens for liquidity
        require(IERC20(secondTokenAddress).transferFrom(_user,address(this),_amount),"not enough");
        require(IERC20(secondTokenAddress).approve(address(routerProxy),_amount),"not enough");
        require(IERC20(gton).approve(address(routerProxy),gtonAmount),"not enough");
        // send liquidity and get lp amount
        uint lpAmount = routerProxy.addLiquidity(
            _pool,
            gtonAmount,
            _amount
        );
        uint farmId = staker.farmId(lp);
        // deposit to farming
        staker.depositFor(farmId,lpAmount,_user);
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
