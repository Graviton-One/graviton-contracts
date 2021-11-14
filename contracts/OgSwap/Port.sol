//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ierc20.sol";
import "./interfaces/uniswapRouter.sol";
import "./interfaces/weth.sol";

contract OGSwap {
    
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
    ) public returns(uint chainFromType,uint chainFromId,uint gtonAmount,address payable receiver,address tokenTo) {
        
         chainFromType = deserializeUint(payload,0,32);
         chainFromId = deserializeUint(payload,32,32);
         gtonAmount = deserializeUint(payload,32*2,32);
         receiver = payable(deserializeAddress(payload,32*3));
         //tokenTo = deserializeAddress(payload,32*3+20);
    
    }
}