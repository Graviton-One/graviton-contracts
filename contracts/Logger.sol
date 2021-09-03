//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ILogger.sol";

/// @title Relay
/// @author Anton Davydov - <fetsorn@gmail.com>
contract Logger is ILogger {
    mapping(bytes32 => mapping(uint256 => bytes)) public override logs;
    mapping(bytes32 => uint256) public override totalLogs;

    function log(bytes32 topic0, bytes memory _log) external override {
        logs[topic0][totalLogs[topic0]] = _log;
        totalLogs[topic0]++;
    }
}
