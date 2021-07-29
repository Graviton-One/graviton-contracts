//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IBalanceKeeperV2.sol";
import "./ILPKeeperV2.sol";
import "./IOracleRouterV2.sol";

/// @title The interface for Graviton oracle router
/// @notice Forwards data about crosschain locking/unlocking events to balance keepers
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface ILockRouter is IOracleRouterV2 {

    /// @notice Address of the contract that tracks governance balances
    function balanceKeeper() external view returns (IBalanceKeeperV2);

    /// @notice Address of the contract that tracks lp-token balances
    function lpKeeper() external view returns (ILPKeeperV2);

    /// @notice Look up topic0 of the event associated with adding governance tokens
    function gtonAddTopic() external view returns (bytes32);

    /// @notice Look up topic0 of the event associated with subtracting governance tokens
    function gtonSubTopic() external view returns (bytes32);

    /// @notice Look up topic0 of the event associated with adding lp-tokens
    function lpAddTopic() external view returns (bytes32);

    /// @notice Look up topic0 of the event associated with subtracting lp-tokens
    function lpSubTopic() external view returns (bytes32);

    /// @notice Sets topic0 of the event associated with subtracting lp-tokens
    function setGTONAddTopic(bytes32 _gtonAddTopic) external;

    /// @notice Sets topic0 of the event associated with subtracting governance tokens
    function setGTONSubTopic(bytes32 _gtonSubTopic) external;

    /// @notice Sets topic0 of the event associated with adding lp-tokens
    function setLPAddTopic(bytes32 _lpAddTopic) external;

    /// @notice Sets topic0 of the event associated with subtracting lp-tokens
    function setLPSubTopic(bytes32 _lpSubTopic) external;

    /// @notice Event emitted when the GTONAddTopic is set via '#setGTONAddTopic'
    /// @param topicOld The previous topic
    /// @param topicNew The new topic
    event SetGTONAddTopic(bytes32 indexed topicOld, bytes32 indexed topicNew);

    /// @notice Event emitted when the GTONSubTopic is set via '#setGTONSubTopic'
    /// @param topicOld The previous topic
    /// @param topicNew The new topic
    event SetGTONSubTopic(bytes32 indexed topicOld, bytes32 indexed topicNew);

    /// @notice Event emitted when the LPAddTopic is set via '#setLPAddTopic'
    /// @param topicOld The previous topic
    /// @param topicNew The new topic
    event SetLPAddTopic(bytes32 indexed topicOld, bytes32 indexed topicNew);

    /// @notice Event emitted when the LPSubTopic is set via '#setLPSubTopic'
    /// @param topicOld The previous topic
    /// @param topicNew The new topic
    event SetLPSubTopic(bytes32 indexed topicOld, bytes32 indexed topicNew);

    /// @notice Event emitted when the data is routed to add to a governance balance
    /// @param uuid Unique identifier of the routed data
    /// @param chain Type of blockchain associated with the routed event, i.e. "EVM"
    /// @param emiter The blockchain-specific address where the data event originated
    /// @param token The blockchain-specific token address
    /// @param sender The blockchain-specific address that sent the tokens
    /// @param receiver The blockchain-specific address to receive the tokens
    /// @dev receiver is always same as sender, kept for compatibility
    /// @param amount The amount of tokens
    event GTONAdd(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes indexed token,
        bytes indexed sender,
        bytes indexed receiver,
        uint256 amount
    );

    /// @notice Event emitted when the data is routed to subtract from a governance balance
    /// @param uuid Unique identifier of the routed data
    /// @param chain Type of blockchain associated with the routed event, i.e. "EVM"
    /// @param emiter The blockchain-specific address where the data event originated
    /// @param token The blockchain-specific token address
    /// @param sender The blockchain-specific address that sent the tokens
    /// @param receiver The blockchain-specific address to receive the tokens
    /// @dev receiver is always same as sender, kept for compatibility
    /// @param amount The amount of tokens
    event GTONSub(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes token,
        bytes sender,
        bytes receiver,
        uint256 amount
    );

    /// @notice Event emitted when the data is routed to add to an lp-token balance
    /// @param uuid Unique identifier of the routed data
    /// @param chain Type of blockchain associated with the routed event, i.e. "EVM"
    /// @param emiter The blockchain-specific address where the data event originated
    /// @param token The blockchain-specific token address
    /// @param sender The blockchain-specific address that sent the tokens
    /// @param receiver The blockchain-specific address to receive the tokens
    /// @dev receiver is always same as sender, kept for compatibility
    /// @param amount The amount of tokens
    event LPAdd(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes indexed token,
        bytes indexed sender,
        bytes indexed receiver,
        uint256 amount
    );

    /// @notice Event emitted when the data is routed to subtract from an lp-token balance
    /// @param uuid Unique identifier of the routed data
    /// @param chain Type of blockchain associated with the routed event, i.e. "EVM"
    /// @param emiter The blockchain-specific address where the data event originated
    /// @param token The blockchain-specific token address
    /// @param sender The blockchain-specific address that sent the tokens
    /// @param receiver The blockchain-specific address to receive the tokens
    /// @dev receiver is always same as sender, kept for compatibility
    /// @param amount The amount of tokens
    event LPSub(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes indexed token,
        bytes indexed sender,
        bytes indexed receiver,
        uint256 amount
    );
}
