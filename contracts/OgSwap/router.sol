//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ierc20.sol";
import "./interfaces/uniswapRouter.sol";
import "./interfaces/weth.sol";
import "./interfaces/wormhole.sol";

contract OGSwap {
    IWETH public eth;
    IERC20 public gtonToken;
    IUniswapV2Router02 public router;
    IUniswapV2Factory public factory;
    Wormhole public wormhole;
    address public owner;
    bool public revertFlag;
    
    modifier onlyOwner() {
        require(msg.sender==owner,'not permitted');
        _;
    }
    
    modifier notReverted() {
        require(!revertFlag,'not permitted');
        _;
    }
    
    event Swap(address indexed from, address indexed to, address indexed tokenFrom, address tokenTo ,uint amountIn, uint amountGton, uint amountOut);
    event CrossChainInput(address indexed from, address indexed tokenFrom, uint amountIn, uint gtonAmount, uint chainId, uint chainType);
    event CrossChainOutput(address indexed to, address indexed tokenTo, uint amountOut, uint gtonAmount);

    constructor (
        address _router,
        address _wormhole,
        address _gtonToken
    ) {
        gtonToken = IERC20(_gtonToken);
        router = IUniswapV2Router02(_router);
        factory = IUniswapV2Factory(router.factory());
        wormhole = Wormhole(_wormhole);
        eth = IWETH(router.WETH());
        revertFlag = false;
    }
    
    function setOwner(address _owner) public onlyOwner {
        owner = _owner;
    }
    
    function toggleRevert() public onlyOwner {
        revertFlag = !revertFlag;
    }
    
    function emergencyTokenTransfer(
        address _token,
        address _user,
        uint _amount
        
    ) public {
        require(IERC20(_token).transfer(_user,_amount),"Err");
    }

    function _internalSwap (
        address _tokenFrom, 
        address _tokenTo, 
        uint _amountTokenIn, 
        uint _minimalAmountOut
    ) internal returns (uint outToken, uint relayGton) {
        IUniswapV2Pair pair0 = IUniswapV2Pair(factory.getPair(_tokenFrom,address(gtonToken)));
        IUniswapV2Pair pair1 = IUniswapV2Pair(factory.getPair(_tokenTo,address(gtonToken)));
        
        (uint reserveA, uint reserveB,) = pair0.getReserves();
        (reserveA, reserveB) = pair0.token0() == address(gtonToken) ? (reserveB,reserveA) : (reserveA,reserveB);

        address[] memory path = new address[](2);
        path[0] = _tokenFrom;
        path[1] = address(gtonToken);
        relayGton = router.getAmountOut(_amountTokenIn,reserveA,reserveB);
        require(IERC20(_tokenFrom).approve(address(router),_amountTokenIn),"not enough money");
        router.swapExactTokensForTokens(
            _amountTokenIn,
            relayGton,
            path,
            address(this),
            block.timestamp + 10000
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
            block.timestamp + 10000
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
        (uint amountOut, uint relayGton) = _internalSwap(
            _tokenFrom,
            _tokenTo,
            _amountTokenIn,
            _minimalAmountOut
        );
        require(IERC20(_tokenTo).transfer(_user,amountOut),"not enough money");
        emit Swap(_provider, _user, _tokenFrom, _tokenTo, _amountTokenIn, relayGton, amountOut);
    }
    
    function onchainSwapFromEth (
        address _tokenTo, 
        uint _amountTokenIn, 
        uint _minimalAmountOut,
        address _user
    ) public payable {
        require(_amountTokenIn <= msg.value, 'EXCESSIVE_INPUT_AMOUNT');
        eth.deposit{value: _amountTokenIn}();
        (uint amountOut, uint relayGton) = _internalSwap(
            address(eth),
            _tokenTo,
            _amountTokenIn,
            _minimalAmountOut
        );
        require(IERC20(_tokenTo).transfer(_user,amountOut),"not enough money");
        emit Swap(msg.sender, _user, address(eth), _tokenTo, _amountTokenIn, relayGton, amountOut);
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
        (uint amountOut, uint relayGton) = _internalSwap(
            _tokenFrom,
            _tokenTo,
            _amountTokenIn,
            _minimalAmountOut
        );
        eth.withdraw(amountOut);
        _user.transfer(amountOut);
        emit Swap(_provider, _user, address(eth), _tokenTo, _amountTokenIn, relayGton, amountOut);
    }
    
    function crossChainFromEth (
        uint8 chainType,
        uint8 chainId,
        uint _amountTokenIn,
        uint32 nonce,
        bytes memory customPayload
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
        bytes memory payload = abi.encodePacked(chainType,chainId,uint8(1),relayGton,customPayload);
        wormhole.lock(
            chainType,
            chainId,
            nonce,
            payload
        );
        uint8 _chainType = chainType;
        emit CrossChainInput(msg.sender, address(eth), _amountTokenIn, relayGton, chainId, _chainType);
    }
    
    function crossChain (
        uint8 chainType,
        uint8 chainId,
        uint _amountTokenIn,
        address _tokenFrom,
        address _provider,
        uint32 nonce,
        bytes memory customPayload
    ) public returns (bytes memory payload) {
        require(IERC20(_tokenFrom).transferFrom(_provider,address(this),_amountTokenIn),"not enough money");
        
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(_tokenFrom,address(gtonToken)));
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
            block.timestamp + 10000
        );
        
        payload = abi.encodePacked(chainType,chainId,uint8(1),relayGton,customPayload);
        wormhole.lock(
            chainType,
            chainId,
            nonce,
            payload
        );
        uint8 _chainType = chainType;
        uint8 _chainId = chainId;
        emit CrossChainInput(_provider, _tokenFrom, _amountTokenIn, relayGton, _chainId, _chainType);
    }
    
    function crossChainFromGton (
        uint8 chainType,
        uint8 chainId,
        uint _amountTokenIn,
        address _provider,
        uint32 nonce,
        bytes memory customPayload
    ) public payable {
        require(IERC20(gtonToken).transferFrom(_provider,address(this),_amountTokenIn),"not enough money");
        bytes memory payload = abi.encodePacked(chainType,chainId,uint8(1),_amountTokenIn,customPayload);
        wormhole.lock(
            chainType,
            chainId,
            nonce,
            payload
        );
        
        emit CrossChainInput(_provider, address(gtonToken), _amountTokenIn, _amountTokenIn, chainId, chainType);
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
    
    function recv (
        bytes calldata payload
    ) public payable {
        require(msg.sender == address(wormhole),"not enough money");
        
        uint gtonAmount = deserializeUint(payload,3,3+32);
        address payable receiver = payable(deserializeAddress(payload,3+32));
        if (payload.length > 3+32+20) {
            address tokenTo = deserializeAddress(payload,3+32+20);
            
            IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(tokenTo,address(gtonToken)));
            (uint reserveA, uint reserveB,) = pair.getReserves();
            (reserveA, reserveB) = pair.token0() == address(gtonToken) ? (reserveB,reserveA) : (reserveA,reserveB);
    
            address[] memory path = new address[](2);
            path[1] = tokenTo;
            path[0] = address(gtonToken);
            uint releaseAmount = router.getAmountOut(gtonAmount,reserveB,reserveA);
            require(gtonToken.approve(address(router),gtonAmount),"not enough money");
            router.swapExactTokensForTokens(
                gtonAmount,
                releaseAmount,
                path,
                address(this),
                block.timestamp + 10000
            );
            emit CrossChainOutput(receiver, tokenTo, releaseAmount, gtonAmount);
            if ( tokenTo == address(eth)) {
                eth.withdraw(releaseAmount);
                receiver.transfer(releaseAmount);
            } else {
                require(IERC20(tokenTo).transfer(receiver,releaseAmount),"not enough money");
            }
            return;
        }
        emit CrossChainOutput(receiver, address(gtonToken), gtonAmount, gtonAmount);
        require(gtonToken.transfer(receiver,gtonAmount),"not enough money");  
        
    }
}