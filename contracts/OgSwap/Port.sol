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
    event CrossChainInput(bytes payload);
    event CrossChainOutput(address indexed to, address indexed tokenTo, uint amountOut, uint gtonAmount);

    constructor (
    ) {

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

    
    function crossChainFromEth (
        uint16 chainType,
        uint16 chainId,
        uint _amountTokenIn,
        bytes memory customPayload
    ) public payable {
        
        bytes memory payload = abi.encodePacked(chainType,chainId,uint16(1),_amountTokenIn,customPayload);
        //wormhole.lock(
        //    chainType,
        //    chainId,
        //    payload
        //);
        //uint16 _chainType = chainType;
        emit CrossChainInput(payload);
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
        
        uint gtonAmount = deserializeUint(payload,6,6+32);
        address payable receiver = payable(deserializeAddress(payload,6+32));
        if (payload.length > 6+32+20) {
            address tokenTo = deserializeAddress(payload,6+32+20);
            emit CrossChainOutput(receiver, tokenTo, gtonAmount, gtonAmount);
            return;
        }
        emit CrossChainOutput(receiver, address(gtonToken), gtonAmount, gtonAmount);
    }
}