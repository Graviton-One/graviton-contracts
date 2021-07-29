//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";
import "./IOracleRouterV2.sol";

/// @title The interface for Graviton oracle router
/// @notice Forwards data about crosschain locking/unlocking events to balance keepers
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IDeliveryRouter is IOracleRouterV2 {

    /// @notice TODO
    function governanceToken() external view returns (IERC20);

    /// @notice TODO
    function wallet() external view returns (address);

    /// @notice TODO
    function setWallet(address _wallet) external;

    /// @notice Look up topic0 of the event associated with adding governance tokens
    function confirmClaimTopic() external view returns (bytes32);

    /// @notice Sets topic0 of the event associated with claiming governance topics
    function setConfirmClaimTopic(bytes32 _lpSubTopic) external;

    /// @notice Event emitted when the ConfirmClaimTopic is set via '#setConfirmClaimTopic'
    /// @param topicOld The previous topic
    /// @param topicNew The new topic
    event SetConfirmClaimTopic(bytes32 indexed topicOld, bytes32 indexed topicNew);

    /// @notice Event emitted when the wallet changes via `#setWallet`.
    /// @param walletOld The previous wallet
    /// @param walletNew The new wallet
    event SetWallet(address indexed walletOld, address indexed walletNew);

    /// @notice TODO
    event DeliverClaim(
        address indexed token,
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );
}
