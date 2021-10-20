//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IPoolProxy {
    function addLiquidity(address pool,uint gtonAmount,uint secondTokenAmount) external returns (uint liquidity);
    function removeLiquidity(uint lpTokenAmount,address pool) external returns (uint amountFirst, uint amountSecond);
    function getGtonAmountForAddLiquidity(address _pool,uint secondTokenAmount) external view returns (uint gtonAmount);
    function getPoolTokens(address pool) external returns (address firstToken, address secondToken, address lp);
    function getAddLiquidityApprove(address pool) external returns (address addr);
    function getPoolResserves(address pool) external returns (uint reserveFirst, uint reserveSecond);
    function takeLiquidityFee(address pool) external returns (uint fee);
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
    address public mutator;
    address public gtonAddress;

    IUniswapV2Router public router;

    constructor(IUniswapV2Router _router, address _mutator, address _gtonAddress) {
        owner = msg.sender;
        router = _router;
        mutator = _mutator;
        gtonAddress = _gtonAddress;
    }
    
    modifier onlyOwner() {
        require(msg.sender==owner,'not owner');
        _;
    }
    modifier onlyMutator() {
        require(msg.sender==owner,'not owner'); // to set candy contract
        _;
    }

    function setMutator(address _mutator) public onlyOwner {
        mutator = _mutator;
    }

    function getSecondAddress(address pool) internal virtual returns (address token) {
        IUniswapV2Pair pair = IUniswapV2Pair(pool);
        return pair.token1();
    }

    function addLiquidity(address pool, uint gtonAmount, uint secondTokenAmount) public onlyMutator returns (uint) {
        uint deadline = block.timestamp + (1 * 1 hours);
        address tokenB = getSecondAddress(pool);
        (uint amountA, uint amountB, uint liquidity) = router.addLiquidity(gtonAddress, tokenB, gtonAmount, secondTokenAmount, gtonAmount, secondTokenAmount, pool, deadline);
        return liquidity;
    }
    function removeLiquidity(uint lpTokenAmount, address pool) public onlyMutator returns (uint, uint) {
        uint deadline = block.timestamp + (1 * 1 hours);
        address tokenB = getSecondAddress(pool);
        return router.addLiquidity(gtonAddress, tokenB, lpTokenAmount, gtonAmount, secondTokenAmount, pool, deadline);
        
    }

}