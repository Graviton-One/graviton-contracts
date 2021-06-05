//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title OracleRouter
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OracleRouterMock {

    function routeValue(bytes16 uuid,
                        string memory chain,
                        address emiter,
                        bytes32 topic0,
                        address topic1,
                        address topic2,
                        uint256 amount) external {}
}
