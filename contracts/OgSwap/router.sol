//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ierc20.sol";
import "./interfaces/uniswapRouter.sol";
import "./interfaces/weth.sol";

contract OGSwap {
    IWETH public eth;
    IERC20 public gtonToken;
    IUniswapV2Router02 public router;
    IUniswapV2Factory public factory;
    address public provisor;
    address public owner;
    bool public revertFlag;
    
    modifier onlyOwner() {
        require(msg.sender==owner,'NOT_PERMITED');
        _;
    }
    
    modifier notReverted() {
        require(!revertFlag,'NOT_PERMITED');
        _;
    }
    
    event Swap(
        address indexed from, 
        address to, 
        address indexed tokenFrom, 
        address indexed tokenTo,
        uint amountIn, 
        uint amountGton, 
        uint amountOut
    );
    event CrossChainInput(
        address indexed from, 
        address indexed tokenFrom,
        uint chainId, 
        uint chainType, 
        uint gton,
        uint amount
    );
    event PayloadMeta(
        uint indexed amount, 
        uint indexed chainType, 
        uint indexed chainId
    );
    event Payload(
        bytes payload
    );
    event CrossChainOutput(
        address indexed to, 
        address indexed tokenTo, 
        uint chainFromType, 
        uint chainFromId, 
        uint amountOut, 
        uint gtonAmount
    );

    constructor (
        address _router,
        address _provisor,
        address _gtonToken
    ) {
        gtonToken = IERC20(_gtonToken);
        router = IUniswapV2Router02(_router);
        factory = IUniswapV2Factory(router.factory());
        provisor = _provisor;
        owner = _provisor;
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
        require(IERC20(_tokenFrom).approve(address(router),_amountTokenIn),"INSUFFICIENT_CONTRACT_BALANCE");
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
        require(gtonToken.approve(address(router),relayGton),"INSUFFICIENT_CONTRACT_BALANCE");
        router.swapExactTokensForTokens(
            relayGton,
            outToken,
            path,
            address(this),
            block.timestamp + 10000
        );
        require(outToken >= _minimalAmountOut,"EXCESSIVE_MINIMAL_AMOUNT_OUT");
    }
    
    function onchainSwap (
        address _tokenFrom, 
        address _tokenTo, 
        uint _amountTokenIn, 
        uint _minimalAmountOut,
        address _user,
        address _provider
    ) public {
        require(IERC20(_tokenFrom).transferFrom(_provider,address(this),_amountTokenIn),"INSUFFICIENT_ALLOWANCE_AMOUNT");
        (uint amountOut, uint relayGton) = _internalSwap(
            _tokenFrom,
            _tokenTo,
            _amountTokenIn,
            _minimalAmountOut
        );
        require(IERC20(_tokenTo).transfer(_user,amountOut),"INSUFFICIENT_CONTRACT_BALANCE");
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
        require(IERC20(_tokenTo).transfer(_user,amountOut),"INSUFFICIENT_CONTRACT_BALANCE");
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
        require(IERC20(_tokenFrom).transferFrom(_provider,address(this),_amountTokenIn),"INSUFFICIENT_ALLOWANCE_AMOUNT ");
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
        uint chainType,
        uint chainId,
        uint _amountTokenIn,
        bytes memory customPayload
    ) public payable {
        
        require(_amountTokenIn <= msg.value, 'INSUFFICIENT_INPUT_AMOUNT');
        eth.deposit{value: _amountTokenIn}();
        
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(address(eth),address(gtonToken)));
        
        (uint reserveA, uint reserveB,) = pair.getReserves();
        (reserveA, reserveB) = pair.token0() == address(gtonToken) ? (reserveB,reserveA) : (reserveA,reserveB);

        address[] memory path = new address[](2);
        path[0] = address(eth);
        path[1] = address(gtonToken);
        uint relayGton = router.getAmountOut(_amountTokenIn,reserveA,reserveB);
        require(eth.approve(address(router),_amountTokenIn),"INSUFFICIENT_CONTRACT_BALANCE");
        router.swapExactTokensForTokens(
            _amountTokenIn,
            relayGton,
            path,
            address(this),
            block.timestamp + 10000
        );
        bytes memory payload = abi.encodePacked(block.number,chainType,chainId,relayGton,customPayload);
        
        emit CrossChainInput(msg.sender, address(eth), chainType, chainId, relayGton, _amountTokenIn);
        emit PayloadMeta(relayGton,chainType,chainId);
        emit Payload(payload);
    }
    
    function crossChain (
        uint chainType,
        uint chainId,
        uint _amountTokenIn,
        address _tokenFrom,
        address _provider,
        bytes memory customPayload
    ) public returns (bytes memory payload) {
        require(IERC20(_tokenFrom).transferFrom(_provider,address(this),_amountTokenIn),"INSUFFICIENT_ALLOWANCE_AMOUNT");
        
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(_tokenFrom,address(gtonToken)));
        (uint reserveA, uint reserveB,) = pair.getReserves();
        (reserveA, reserveB) = pair.token0() == address(gtonToken) ? (reserveB,reserveA) : (reserveA,reserveB);

        address[] memory path = new address[](2);
        path[0] = _tokenFrom;
        path[1] = address(gtonToken);
        uint relayGton = router.getAmountOut(_amountTokenIn,reserveA,reserveB);
        require(IERC20(_tokenFrom).approve(address(router),_amountTokenIn),"INSUFFICIENT_CONTRACT_BALANCE");
        router.swapExactTokensForTokens(
            _amountTokenIn,
            relayGton,
            path,
            address(this),
            block.timestamp + 10000
        );
        
        payload = abi.encodePacked(block.number,chainType,chainId,relayGton,customPayload);
        emit CrossChainInput(_provider, _tokenFrom, chainType, chainId, relayGton, _amountTokenIn);
        emit PayloadMeta(relayGton,chainType,chainId);
        emit Payload(payload);
    }
    
    function crossChainFromGton (
        uint chainType,
        uint chainId,
        uint _amountTokenIn,
        address _provider,
        bytes memory customPayload
    ) public {
        require(IERC20(gtonToken).transferFrom(_provider,address(this),_amountTokenIn),"");
        bytes memory payload = abi.encodePacked(block.number,chainType,chainId,_amountTokenIn,customPayload);
        
        emit CrossChainInput(_provider, address(gtonToken), chainType, chainId, _amountTokenIn, _amountTokenIn);
        emit PayloadMeta(_amountTokenIn,chainType,chainId);
        emit Payload(payload);
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
    
    function setFee(uint _fee) public onlyOwner {
        fee = _fee;
    }
    
    function setProvisor(address _provisor) public onlyOwner {
        provisor = _provisor;
    }
    
    function tokenWithdraw(uint _amount, address _token, address _user) public onlyOwner {
        require(IERC20(_token).transfer(_user,_amount),'INSUFFICIENT_CONTRACT_BALANCE');
    }
    
    mapping (bytes => bool) public processedData;
    uint public fee;
    
    function recv (
        bytes calldata payload
    ) public {
        require(msg.sender == address(provisor),"NOT_PROVISOR");
        require(!processedData[payload],"DATA_ALREADY_PROCESSED");
        processedData[payload] = true;
        
        uint chainFromType = deserializeUint(payload,32,32);
        uint chainFromId = deserializeUint(payload,32*2,32);

        uint gtonAmount = deserializeUint(payload,32*3,32) - fee;
        address payable receiver = payable(deserializeAddress(payload,32*4));
        if (payload.length > 32*5) {
            address tokenTo = deserializeAddress(payload,32*4+20);
            (address t0, address t1) = tokenTo < address(gtonToken) ? (tokenTo,address(gtonToken)) : (address(gtonToken),tokenTo);
            IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(t0,t1));
            (uint reserveA, uint reserveB,) = pair.getReserves();
            (reserveA, reserveB) = pair.token0() == address(gtonToken) ? (reserveB,reserveA) : (reserveA,reserveB);
            address[] memory path = new address[](2);
            path[1] = tokenTo;
            path[0] = address(gtonToken);
            uint releaseAmount = router.getAmountOut(gtonAmount,reserveB,reserveA);
            require(gtonToken.approve(address(router),gtonAmount),"INSUFFICIENT_CONTRACT_BALANCE");
            router.swapExactTokensForTokens(
                gtonAmount,
                releaseAmount,
                path,
                address(this),
                block.timestamp + 10000
            );
            emit CrossChainOutput(receiver, tokenTo, chainFromType, chainFromId, releaseAmount, gtonAmount);
            if ( tokenTo == address(eth)) {
                eth.withdraw(releaseAmount);
                receiver.transfer(releaseAmount);
            } else {
                require(IERC20(tokenTo).transfer(receiver,releaseAmount),"INSUFFICIENT_CONTRACT_BALANCE");
            }
            return;
        }
        emit CrossChainOutput(receiver, address(gtonToken), chainFromType, chainFromId, gtonAmount, gtonAmount);
        require(gtonToken.transfer(receiver,gtonAmount),"INSUFFICIENT_CONTRACT_BALANCE");  
    
    }
}