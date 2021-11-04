//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface Wormhole {
    function lock(
        uint8 chainType,
        uint8 chainId,
        bytes calldata customPayload
    ) external; 
}

interface IWETH {
    function deposit() external payable;
    function withdraw(uint) external;
    
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);
    

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
}

interface IUniswapV2Router01 {
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

interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}

interface IUniswapV2Router02 is IUniswapV2Router01 {
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountETH);
    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountETH);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

interface IERC20 {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
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



contract OGSwap {
    IWETH public eth;
    IERC20 public gtonToken;
    IUniswapV2Router02 public router;
    IUniswapV2Factory public factory;
    Wormhole public wormhole;

    function _internalSwap (
        address _tokenFrom, 
        address _tokenTo, 
        uint _amountTokenIn, 
        uint _minimalAmountOut
    ) internal returns (uint outToken) {
        IUniswapV2Pair pair0 = IUniswapV2Pair(factory.getPair(_tokenFrom,address(gtonToken)));
        IUniswapV2Pair pair1 = IUniswapV2Pair(factory.getPair(_tokenTo,address(gtonToken)));
        
        (uint reserveA, uint reserveB,) = pair0.getReserves();
        (reserveA, reserveB) = pair0.token0() == address(gtonToken) ? (reserveB,reserveA) : (reserveA,reserveB);

        address[] memory path = new address[](2);
        path[0] = _tokenFrom;
        path[1] = address(gtonToken);
        uint relayGton = router.getAmountOut(_amountTokenIn,reserveA,reserveB);
        require(IERC20(_tokenFrom).approve(address(router),_amountTokenIn),"not enough money");
        router.swapExactTokensForTokens(
            _amountTokenIn,
            relayGton,
            path,
            address(this),
            block.number + 10
        );
        
        (reserveA,reserveB,) = pair1.getReserves();
        (reserveA, reserveB) = pair1.token0() == address(gtonToken) ? (reserveB,reserveA) : (reserveA,reserveB);
        
        outToken = router.getAmountOut(relayGton,reserveB,reserveA);
        path[1] = _tokenTo;
        path[0] = address(gtonToken);
        require(gtonToken.approve(address(router),relayGton),"not enough money");
        router.swapExactTokensForTokens(
            relayGton,
            outToken,
            path,
            address(this),
            block.number + 10
        );
        require(outToken >= _minimalAmountOut,"minimal amount out is highter");
    }
    
    function onchainSwap (
        address _tokenFrom, 
        address _tokenTo, 
        uint _amountTokenIn, 
        uint _minimalAmountOut,
        address _user,
        address _provider
    ) public {
        require(IERC20(_tokenFrom).transferFrom(_provider,address(this),_amountTokenIn),"not enough money");
        uint amountOut = _internalSwap(
            _tokenFrom,
            _tokenTo,
            _amountTokenIn,
            _minimalAmountOut
        );
        require(IERC20(_tokenTo).transfer(_user,amountOut),"not enough money");
    }
    
    function onchainSwapFromEth (
        address _tokenTo, 
        uint _amountTokenIn, 
        uint _minimalAmountOut,
        address _user
    ) public payable {
        require(_amountTokenIn <= msg.value, 'EXCESSIVE_INPUT_AMOUNT');
        eth.deposit{value: _amountTokenIn}();
        uint amountOut = _internalSwap(
            address(eth),
            _tokenTo,
            _amountTokenIn,
            _minimalAmountOut
        );
        require(IERC20(_tokenTo).transfer(_user,amountOut),"not enough money");
    }
    
    function onchainSwapToEth (
        address _tokenFrom, 
        address _tokenTo, 
        uint _amountTokenIn, 
        uint _minimalAmountOut,
        address payable _user,
        address _provider
    ) public payable {
        require(IERC20(_tokenFrom).transferFrom(_provider,address(this),_amountTokenIn),"not enough money");
        uint amountOut = _internalSwap(
            _tokenFrom,
            _tokenTo,
            _amountTokenIn,
            _minimalAmountOut
        );
        eth.withdraw(amountOut);
        _user.transfer(amountOut);
    }
    
    function crossChainFromEth (
        uint8 chainType,
        uint8 chainId,
        uint _amountTokenIn,
        bytes8[] calldata customPayload
    ) public payable {
        
        require(_amountTokenIn <= msg.value, 'EXCESSIVE_INPUT_AMOUNT');
        eth.deposit{value: _amountTokenIn}();
        
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(address(eth),address(gtonToken)));
        
        (uint reserveA, uint reserveB,) = pair.getReserves();
        (reserveA, reserveB) = pair.token0() == address(gtonToken) ? (reserveB,reserveA) : (reserveA,reserveB);

        address[] memory path = new address[](2);
        path[0] = address(eth);
        path[1] = address(gtonToken);
        uint relayGton = router.getAmountOut(_amountTokenIn,reserveA,reserveB);
        require(eth.approve(address(router),_amountTokenIn),"not enough money");
        router.swapExactTokensForTokens(
            _amountTokenIn,
            relayGton,
            path,
            address(this),
            block.number + 10
        );
        
        bytes memory payload = abi.encodePacked(chainType,chainId,relayGton,customPayload);
        wormhole.lock(
            chainType,
            chainId,
            payload
        );
    }
    
    function crossChain (
        uint8 chainType,
        uint8 chainId,
        uint _amountTokenIn,
        address _tokenFrom,
        address _provider,
        bytes8[] calldata customPayload
    ) public payable {
        require(IERC20(_tokenFrom).transferFrom(_provider,address(this),_amountTokenIn),"not enough money");
        
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(address(eth),address(gtonToken)));
        (uint reserveA, uint reserveB,) = pair.getReserves();
        (reserveA, reserveB) = pair.token0() == address(gtonToken) ? (reserveB,reserveA) : (reserveA,reserveB);

        address[] memory path = new address[](2);
        path[0] = _tokenFrom;
        path[1] = address(gtonToken);
        uint relayGton = router.getAmountOut(_amountTokenIn,reserveA,reserveB);
        require(IERC20(_tokenFrom).approve(address(router),_amountTokenIn),"not enough money");
        router.swapExactTokensForTokens(
            _amountTokenIn,
            relayGton,
            path,
            address(this),
            block.number + 10
        );
        
        bytes memory payload = abi.encodePacked(chainType,chainId,relayGton,customPayload);
        wormhole.lock(
            chainType,
            chainId,
            payload
        );
    }
}