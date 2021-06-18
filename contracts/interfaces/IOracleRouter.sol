//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IOracleRouter {
    function routeValue(
        bytes16 uuid,
        string calldata chain,
        address emiter,
        bytes32 topic0,
        address token,
        address sender,
        address receiver,
        uint256 amount
    ) external;
}
