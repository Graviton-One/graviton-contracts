// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

contract OracleRouterMock {

    function routeValue(bytes16 uuid,
                        string memory chain,
                        address emiter,
                        bytes32 topic0,
                        address topic1,
                        address topic2,
                        address topic3,
                        uint256 amount) external {}
}
