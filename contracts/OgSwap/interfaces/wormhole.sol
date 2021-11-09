//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface Wormhole {
    function lock(
        uint8 chainType,
        uint8 chainId,
        bytes calldata customPayload
    ) external; 
}