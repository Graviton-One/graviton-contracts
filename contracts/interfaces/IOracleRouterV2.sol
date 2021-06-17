//SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;

interface IOracleRouterV2 {
    function routeValue(bytes16 uuid,
                        string memory chain,
                        bytes memory emiter,
                        bytes32 topic0,
                        bytes memory token,
                        bytes memory sender,
                        bytes memory receiver,
                        uint256 amount) external;
}
