//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./ILogger.sol";

/// @author Anton Davydov - <fetsorn@gmail.com>
interface ILogger {
    function logs(
        address sender,
        bytes32 chain,
        uint256 index
    ) external view returns (bytes memory _log);

    function totalLogs(address sender, bytes32 chain)
        external
        view
        returns (uint256 index);

    function log(bytes32 topic0, bytes memory _log) external;
}
