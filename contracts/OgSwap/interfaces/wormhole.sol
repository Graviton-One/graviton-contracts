//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface Wormhole {
    function lock(
        uint16 chainType,
        uint16 chainId,
        uint32 nonce,
        bytes calldata customPayload
    ) external; 
}