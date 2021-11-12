//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ICan.sol";

// interface IERC20 {
//     function mint(address _to, uint256 _value) external;

//     function allowance(address owner, address spender)
//         external
//         view
//         returns (uint256);

//     function approve(address spender, uint256 amount) external returns (bool);

//     function increaseAllowance(address spender, uint256 addedValue)
//         external
//         returns (bool);

//     function transfer(address _to, uint256 _value)
//         external
//         returns (bool success);

//     function transferFrom(
//         address _from,
//         address _to,
//         uint256 _value
//     ) external returns (bool success);

//     function balanceOf(address _owner) external view returns (uint256 balance);
//     function totalSupply() external view returns (uint256 supply);
// }

// interface IPoolPair {
//     event Approval(address indexed owner, address indexed spender, uint value);
//     event Transfer(address indexed from, address indexed to, uint value);

//     function name() external pure returns (string memory);
//     function symbol() external pure returns (string memory);
//     function decimals() external pure returns (uint8);
//     function totalSupply() external view returns (uint);
//     function balanceOf(address owner) external view returns (uint);
//     function allowance(address owner, address spender) external view returns (uint);

//     function approve(address spender, uint value) external returns (bool);
//     function transfer(address to, uint value) external returns (bool);
//     function transferFrom(address from, address to, uint value) external returns (bool);

//     function DOMAIN_SEPARATOR() external view returns (bytes32);
//     function PERMIT_TYPEHASH() external pure returns (bytes32);
//     function nonces(address owner) external view returns (uint);

//     function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;

//     event Mint(address indexed sender, uint amount0, uint amount1);
//     event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
//     event Swap(
//         address indexed sender,
//         uint amount0In,
//         uint amount1In,
//         uint amount0Out,
//         uint amount1Out,
//         address indexed to
//     );
//     event Sync(uint112 reserve0, uint112 reserve1);

//     function MINIMUM_LIQUIDITY() external pure returns (uint);
//     function factory() external view returns (address);
//     function token0() external view returns (address);
//     function token1() external view returns (address);
//     function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
//     function price0CumulativeLast() external view returns (uint);
//     function price1CumulativeLast() external view returns (uint);
//     function kLast() external view returns (uint);

//     function mint(address to) external returns (uint liquidity);
//     function burn(address to) external returns (uint amount0, uint amount1);
//     function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
//     function skim(address to) external;
//     function sync() external;

//     function initialize(address, address) external;
// }

// interface IPoolProxy {
//     function factory() external pure returns (address);
//     function WETH() external pure returns (address);
//     function addLiquidity(
//         address tokenA,
//         address tokenB,
//         uint amountADesired,
//         uint amountBDesired,
//         uint amountAMin,
//         uint amountBMin,
//         address to,
//         uint deadline
//     ) external returns (uint amountA, uint amountB, uint liquidity);
//     function addLiquidityETH(
//         address token,
//         uint amountTokenDesired,
//         uint amountTokenMin,
//         uint amountETHMin,
//         address to,
//         uint deadline
//     ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
//     function removeLiquidity(
//         address tokenA,
//         address tokenB,
//         uint liquidity,
//         uint amountAMin,
//         uint amountBMin,
//         address to,
//         uint deadline
//     ) external returns (uint amountA, uint amountB);
//     function removeLiquidityETH(
//         address token,
//         uint liquidity,
//         uint amountTokenMin,
//         uint amountETHMin,
//         address to,
//         uint deadline
//     ) external returns (uint amountToken, uint amountETH);
//     function removeLiquidityWithPermit(
//         address tokenA,
//         address tokenB,
//         uint liquidity,
//         uint amountAMin,
//         uint amountBMin,
//         address to,
//         uint deadline,
//         bool approveMax, uint8 v, bytes32 r, bytes32 s
//     ) external returns (uint amountA, uint amountB);
//     function removeLiquidityETHWithPermit(
//         address token,
//         uint liquidity,
//         uint amountTokenMin,
//         uint amountETHMin,
//         address to,
//         uint deadline,
//         bool approveMax, uint8 v, bytes32 r, bytes32 s
//     ) external returns (uint amountToken, uint amountETH);
//     function swapExactTokensForTokens(
//         uint amountIn,
//         uint amountOutMin,
//         address[] calldata path,
//         address to,
//         uint deadline
//     ) external returns (uint[] memory amounts);
//     function swapTokensForExactTokens(
//         uint amountOut,
//         uint amountInMax,
//         address[] calldata path,
//         address to,
//         uint deadline
//     ) external returns (uint[] memory amounts);
//     function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
//         external
//         payable
//         returns (uint[] memory amounts);
//     function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
//         external
//         returns (uint[] memory amounts);
//     function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
//         external
//         returns (uint[] memory amounts);
//     function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
//         external
//         payable
//         returns (uint[] memory amounts);

//     function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
//     function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
//     function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
//     function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
//     function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
// }

// interface IFarmProxy {
//     function deposit(uint256 _pid, uint256 _amount) external;
//     function withdraw(uint256 _pid, uint256 _amount) external;
//     function pendingRelict(uint256 _pid, address _user) external view returns (uint256);
// }

contract Can is ICan {
    
    struct UserTokenData {
        uint providedAmount;
        uint farmingAmount;
        uint rewardDebt;
        uint aggregatedReward;
    }
    
    struct CanData {
        uint totalProvidedTokenAmount;
        uint totalFarmingTokenAmount;
        uint accRewardPerShare;
        uint totalRewardsClaimed;
        uint farmId;
        IFarmProxy farm;
        IPoolProxy router;
        IPoolPair lpToken;
        IERC20 providingToken;
        IERC20 rewardToken;
        uint fee;
    }
    
    bool public revertFlag;
    address public owner;
    address public feeReceiver;  

    constructor(
        address _owner,
        address _feeReceiver,
        uint _farmId,
        address _farm,
        address _router,
        address _lpToken,
        address _providingToken,
        address _rewardToken,
        uint _fee
    ) {
        owner = _owner;
        revertFlag = false;
        feeReceiver = _feeReceiver;
        canInfo.farmId = _farmId;
        canInfo.farm = IFarmProxy(_farm);
        canInfo.router = IPoolProxy(_router);
        canInfo.lpToken = IPoolPair(_lpToken);
        canInfo.providingToken = IERC20(_providingToken);
        canInfo.rewardToken = IERC20(_rewardToken);
        canInfo.fee = _fee;
    }
    
    modifier onlyOwner() {
        require(msg.sender==owner,'not owner');
        _;
    }
    
    modifier notReverted() {
        require(!revertFlag,'Option is closed to use');
        _;
    }
    
    function toggleRevert() public override onlyOwner {
        revertFlag = !revertFlag;
    }
    
    function transferOwnership(address newOwner) public override onlyOwner {
        owner = newOwner;
    }
    
    function emergencyTakeout(IERC20 _token, address _to, uint _amount) public override onlyOwner {
        require(_token.transfer(_to,_amount),"error");
    }
    
    function emergencySendToFarming(uint _amount) public override onlyOwner {
        require(canInfo.lpToken.approve(address(canInfo.farm),_amount),"no enough token");
        canInfo.farm.deposit(canInfo.farmId,_amount);
    }
    
    function emergencyGetFromFarming(uint _amount) public override onlyOwner {
        CanData storage canData = canInfo;
        uint pendingAmount = canData.farm.pendingRelict(canData.farmId,address(this));
        canData.farm.withdraw(canData.farmId,_amount);
        canData.accRewardPerShare += pendingAmount * 1e12 / canData.totalProvidedTokenAmount;
    }
    
    CanData public canInfo;
    mapping (address => UserTokenData) public usersInfo;
    
    function changeCanFee(uint _fee) public override onlyOwner {
        canInfo.fee = _fee;
    }
    
    function updateCan() public override notReverted {
        CanData storage canData = canInfo;
        uint pendingAmount = canData.farm.pendingRelict(canData.farmId,address(this));
        canData.farm.withdraw(canData.farmId,0);
        if(canData.totalProvidedTokenAmount > 0) {
           canData.accRewardPerShare += pendingAmount * 1e12 / canData.totalProvidedTokenAmount;         
        }
    }

    // creates some can tokens for user in declared stack
    function mintFor(address _user, uint _providedAmount) public override notReverted {
        // getting user and stack info from mappings
        UserTokenData storage userTokenData = usersInfo[_user];
        CanData storage canData = canInfo;
        updateCan();
        
        // get second token amount for liquidity
        address firstToken = canData.lpToken.token0();
        address secondToken = canData.lpToken.token1();
        (uint reserve0, uint reserve1,) = canData.lpToken.getReserves();
        uint reserveFirst;
        uint reserveSecond;
        if (secondToken == address(canData.providingToken)) {
            secondToken = firstToken;
            firstToken = address(canData.providingToken);
            reserveFirst = reserve1;
            reserveSecond = reserve0;
        } else {
            reserveFirst = reserve0;
            reserveSecond = reserve1;  
        }
        uint secondTokenAmount = canData.router.quote(_providedAmount,reserveFirst,reserveSecond);
        // approve tokens for liquidity
        require(IERC20(firstToken).transferFrom(_user,address(this),_providedAmount),"not enough");
        
        require(IERC20(firstToken).approve(address(canData.router),_providedAmount),"not enough");
        require(IERC20(secondToken).approve(address(canData.router),secondTokenAmount),"not enough");
        
        uint providingAmount = _providedAmount;
        // send liquidity and get lp amount
        (,,uint lpAmount) = canData.router.addLiquidity(
            firstToken,
            secondToken,
            providingAmount,
            secondTokenAmount,
            providingAmount,
            secondTokenAmount,
            address(this),
            block.timestamp + 10000
        );
        // send lp tokens to farming
        require(IERC20(address(canData.lpToken)).approve(address(canData.farm),lpAmount),"not enough"); 
        canData.farm.deposit(canData.farmId,lpAmount);
    
        // previous pending reward goes to aggregated reward
        userTokenData.aggregatedReward = lpAmount * canData.accRewardPerShare / 1e12 - userTokenData.rewardDebt;
        // incrementing provided and lp amount
        userTokenData.providedAmount += _providedAmount;
        userTokenData.farmingAmount += lpAmount;
        // updating reward reward debt
        userTokenData.rewardDebt = userTokenData.providedAmount * canData.accRewardPerShare / 1e12;
        canData.totalProvidedTokenAmount += _providedAmount;
        canData.totalFarmingTokenAmount += lpAmount;
    }
    
    
    // creates some can tokens for user in declared stack
    function burnFor(address _user, uint _providedAmount, uint _rewardAmount) public override notReverted {
        // getting user and stack info from mappings
        UserTokenData storage userTokenData = usersInfo[_user];
        CanData storage canData = canInfo;
        updateCan();
        
        // get token adresses from pair
        address firstToken = canData.lpToken.token0();
        address secondToken = canData.lpToken.token1();
        (uint reserve0, uint reserve1,) = canData.lpToken.getReserves();
        uint reserveFirst;
        uint reserveSecond;
        if (secondToken == address(canData.providingToken)) {
            secondToken = firstToken;
            firstToken = address(canData.providingToken);
            reserveFirst = reserve1;
            reserveSecond = reserve0;
        } else {
            reserveFirst = reserve0;
            reserveSecond = reserve1;  
        }
        
        // calculate lp amount
        require(_providedAmount <= userTokenData.providedAmount, "insufficent amount");
        // aggregate rewards  and transfer
        userTokenData.aggregatedReward += userTokenData.farmingAmount * canData.accRewardPerShare / 1e12 - userTokenData.rewardDebt;
        require(_rewardAmount <= userTokenData.aggregatedReward, "insufficent amount");
        require(canData.rewardToken.transfer(_user,(_rewardAmount - canData.fee)),'lol');
        // transfer fee 
        require(canData.rewardToken.transfer(feeReceiver,canData.fee),'unable to transfer fee');
        userTokenData.aggregatedReward -= _rewardAmount;
        canData.totalRewardsClaimed += _rewardAmount;
        // prevent stack too deep
        uint providingAmount = _providedAmount;
        address user = _user;
            
         if(_providedAmount > 0) {
       
            uint lpAmountToTakeFromPool = _providedAmount * canData.lpToken.totalSupply() / reserveFirst;
        
            canData.farm.withdraw(canData.farmId, lpAmountToTakeFromPool);
            require(canData.lpToken.approve(address(canData.router), lpAmountToTakeFromPool), "Cannot approve to withdraw");
            (uint amountFirst,) = canData.router.removeLiquidity(
            address(canData.providingToken),
            secondToken,
            lpAmountToTakeFromPool,
            providingAmount,
            0,
            address(this),
            block.timestamp + 10000
            );
            
            require(IERC20(address(canData.providingToken)).transfer(user,amountFirst),'transfer provided amount error');

            userTokenData.providedAmount -= _providedAmount;
            userTokenData.farmingAmount = (userTokenData.providedAmount - _providedAmount) * canData.lpToken.totalSupply() / reserveFirst;
        
            canData.totalProvidedTokenAmount -= _providedAmount;
            canData.totalFarmingTokenAmount -= lpAmountToTakeFromPool;
         }
         
        userTokenData.rewardDebt = userTokenData.farmingAmount * canData.accRewardPerShare / 1e12;
    }
    
    function transfer(address _from, address _to, uint _providingAmount, uint _rewardAmount) public override notReverted {
        require(msg.sender == _from, 'not allowed');
 
        UserTokenData storage from_data = usersInfo[_from];       
        UserTokenData storage to_data = usersInfo[_to];
        CanData storage canData = canInfo;
        updateCan();
        
        require(_providingAmount <= from_data.providedAmount, "insufficent amount");
        uint farmingDelta = _providingAmount * from_data.farmingAmount / from_data.providedAmount;
        
        from_data.aggregatedReward += from_data.farmingAmount * canData.accRewardPerShare / 1e12 - from_data.rewardDebt;
        to_data.aggregatedReward += to_data.farmingAmount * canData.accRewardPerShare / 1e12 - to_data.rewardDebt;
       
        require(_rewardAmount <= from_data.aggregatedReward, "insufficent amount"); 
        to_data.aggregatedReward += _rewardAmount;
        from_data.aggregatedReward -= _rewardAmount;

        // decrementing provided and lp amount and aggregatedReward
        from_data.providedAmount -= _providingAmount;
        from_data.farmingAmount -= farmingDelta;
        
        to_data.providedAmount += _providingAmount;
        to_data.farmingAmount += farmingDelta;
        
        // updating reward reward debt
        from_data.rewardDebt = from_data.farmingAmount * canData.accRewardPerShare / 1e12;
        to_data.rewardDebt = to_data.farmingAmount * canData.accRewardPerShare / 1e12;
    }
    
}

