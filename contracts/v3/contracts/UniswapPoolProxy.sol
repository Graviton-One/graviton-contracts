//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IERC20.sol";

interface IPoolProxy {
    function addLiquidity(address pool,uint gtonAmount,uint secondTokenAmount) external returns (uint liquidity);
    function removeLiquidity(uint lpTokenAmount,address pool,uint requestedAmount) external returns (uint amountFirst, uint amountSecond);
    function getGtonAmountForAddLiquidity(address _pool,uint secondTokenAmount) external view returns (uint gtonAmount);
    function getPoolTokens(address pool) external returns (address firstToken, address secondToken);
    function getPoolReserves(address pool) external returns (uint reserveFirst, uint reserveSecond);
    function sendLiquidity(address _user, address pool, uint _providedAmount) external returns (uint lpAmount);
}

interface IFarmProxy {
    function sendToFarming(address farm, uint amount) external;
    function claimReward(address farm, uint farmId) external returns(uint);
    function pendingReward(address farm) external view returns(uint);
    function takeFromFarming(address farm, uint amount) external;
    function getFarmingApprove(address farm) external returns (address addr);
}

interface IUniswapV2Pair {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function PERMIT_TYPEHASH() external pure returns (bytes32);
    function nonces(address owner) external view returns (uint);

    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    function MINIMUM_LIQUIDITY() external pure returns (uint);
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function price0CumulativeLast() external view returns (uint);
    function price1CumulativeLast() external view returns (uint);
    function kLast() external view returns (uint);

    function mint(address to) external returns (uint liquidity);
    function burn(address to) external returns (uint amount0, uint amount1);
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function skim(address to) external;
    function sync() external;

    function initialize(address, address) external;
}

// File: contracts/interfaces/IUniswapV2Router01.sol

pragma solidity >=0.6.2;

interface IUniswapV2Router {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);
    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountToken, uint amountETH);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);

    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

contract UniswapProxy is IPoolProxy {
    address public owner;
    address public candy;
    address public gtonAddress;

    IUniswapV2Router public router;

    constructor(IUniswapV2Router _router, address _candy, address _gtonAddress) {
        owner = msg.sender;
        router = _router;
        candy = _candy;
        gtonAddress = _gtonAddress;
    }
    
    modifier onlyOwner() {
        require(msg.sender==owner,'Not a owner.');
        _;
    }
    modifier onlyMutator() {
        require(msg.sender==candy, 'Not a candy.'); // to set candy contract
        _;
    }

    function setMutator(address _candy) public onlyOwner {
        candy = _candy;
    }

    function getSecondAddress(address pool) internal virtual returns (address token) {
        IUniswapV2Pair pair = IUniswapV2Pair(pool);
        return pair.token1();
    }

    function getPoolReserves(address pool) public override view returns (uint, uint) {
        IUniswapV2Pair pair = IUniswapV2Pair(pool);
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        return (reserve0, reserve1);
    }

    function addLiquidity(address pool, uint gtonAmount, uint secondTokenAmount) public override onlyMutator returns (uint) {
        uint deadline = block.timestamp + (1 * 1 hours);
        address tokenB = getSecondAddress(pool);
        (,, uint liquidity) = router.addLiquidity(gtonAddress, tokenB, gtonAmount, secondTokenAmount, gtonAmount, secondTokenAmount, candy, deadline);
        return liquidity;
    }
    function removeLiquidity(uint lpTokenAmount, address pool, uint provided) public override onlyMutator returns (uint, uint) {
        uint deadline = block.timestamp + (1 * 1 hours);
        address tokenB = getSecondAddress(pool);
        require(IERC20(pool).transferFrom(candy, address(this), lpTokenAmount));
        // need to check if provided liauidity goes to the second token
        return router.removeLiquidity(gtonAddress, tokenB, lpTokenAmount, 0, provided, candy, deadline);
    }
    function getGtonAmountForAddLiquidity(address _pool,uint secondTokenAmount) public override view returns (uint) {
        (uint reserve0, uint reserve1) = getPoolReserves(_pool);
        // quote(uint amountA, uint reserveA, uint reserveB) 
        return router.quote(secondTokenAmount, reserve1, reserve0);
    }
    function getPoolTokens(address pool) public override view returns (address, address) {
        IUniswapV2Pair pair = IUniswapV2Pair(pool);
        address token0 = pair.token0();
        address token1 = pair.token1();
        return (token0, token1);
    }
    
    function sendLiquidity(address _user, address pool, uint _providedAmount) public override onlyMutator returns (uint) {
        // get pool infor and gton amount 
        (address firstTokenAddress, address secondTokenAddress) = getPoolTokens(pool);
        uint secondTokenAmount = getGtonAmountForAddLiquidity(pool, _providedAmount);
        // approve tokens for liquidity
        require(IERC20(firstTokenAddress).transferFrom(_user, address(this),_providedAmount),"Not enought of approved amount");
        
        address approveAddress = address(router);
        require(IERC20(firstTokenAddress).approve(approveAddress,_providedAmount),"not enough");
        require(IERC20(secondTokenAddress).approve(approveAddress,secondTokenAmount),"not enough");
        // send liquidity and get lp amount
        uint lpAmount = addLiquidity(
            pool,
            _providedAmount,
            secondTokenAmount
        );
        return lpAmount;
    }
}