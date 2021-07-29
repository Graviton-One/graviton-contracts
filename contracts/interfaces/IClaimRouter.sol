//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IBalanceKeeperV2.sol";
import "./ILPKeeperV2.sol";
import "./IOracleRouterV2.sol";

/// @title The interface for Graviton oracle router
/// @notice Forwards data about crosschain locking/unlocking events to balance keepers
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IClaimRouter is IOracleRouterV2 {

    /// @notice Address of the contract that tracks governance balances
    function balanceKeeper() external view returns (IBalanceKeeperV2);

    /// @notice TODO
    function requestClaimTopic() external view returns (bytes32);

    /// @notice TODO
    function setRequestClaimTopic(bytes32 _requestClaimTopic) external;

    /// @notice TODO
    /// @param topicOld The previous topic
    /// @param topicNew The new topic
    event SetRequestClaimTopic(bytes32 indexed topicOld, bytes32 indexed topicNew);

    /// @notice TODO
    event ClaimBSC(
        bytes indexed token,
        bytes indexed sender,
        bytes indexed receiver,
        uint256 amount
    );

    /// @notice TODO
    event ClaimPLG(
        bytes indexed token,
        bytes indexed sender,
        bytes indexed receiver,
        uint256 amount
    );

    /// @notice TODO
    event ClaimETH(
        bytes indexed token,
        bytes indexed sender,
        bytes indexed receiver,
        uint256 amount
    );

}
