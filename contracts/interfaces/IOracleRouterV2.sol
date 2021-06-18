//SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;

import "./IBalanceKeeperV2.sol";
import "./ILPKeeperV2.sol";

interface IOracleRouterV2 {
    function owner() external view returns (address);
    function balanceKeeper() external view returns (IBalanceKeeperV2);
    function lpKeeper() external view returns (ILPKeeperV2);
    function gtonAddTopic() external view returns (bytes32);
    function gtonSubTopic() external view returns (bytes32);
    function lpAddTopic() external view returns (bytes32);
    function lpSubTopic() external view returns (bytes32);
    function canRoute(address user) external view returns (bool);
    function setGTONAddTopic(bytes32 _gtonAddTopic) external;
    function setGTONSubTopic(bytes32 _gtonSubTopic) external;
    function setLPAddTopic(bytes32 _lpAddTopic) external;
    function setLPSubTopic(bytes32 _lpSubTopic) external;
    function setCanRoute(address parser, bool _canRoute) external;
    function routeValue(bytes16 uuid,
                        string memory chain,
                        bytes memory emiter,
                        bytes32 topic0,
                        bytes memory token,
                        bytes memory sender,
                        bytes memory receiver,
                        uint256 amount) external;
}
