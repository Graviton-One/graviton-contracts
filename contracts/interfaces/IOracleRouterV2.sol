//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IBalanceKeeperV2.sol";
import "./ILPKeeperV2.sol";

/// @title The interface for Graviton oracle router
/// @notice Forwards data about crosschain locking/unlocking events to balance keepers
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IOracleRouterV2 {
    /// @notice User that can grant access permissions and perform privileged actions
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    function setOwner(address _owner) external;

    /// @notice Look up if `user` can route data to balance keepers
    function canRoute(address user) external view returns (bool);

    /// @notice Sets the permission to route data to balance keepers
    /// @dev Can only be called by the current owner.
    function setCanRoute(address parser, bool _canRoute) external;

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

    /// @notice Routes value to balance keepers according to the type of event associated with topic0
    function routeValue(
        bytes16 uuid,
        string memory chain,
        bytes memory emiter,
        bytes32 topic0,
        bytes memory token,
        bytes memory sender,
        bytes memory receiver,
        uint256 amount
    ) external;

    /// @notice Event emitted when the owner changes via #setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    event SetOwner(address ownerOld, address ownerNew);

    /// @notice Event emitted when the `parser` permission is updated via `#setCanRoute`
    /// @param owner The owner account at the time of change
    /// @param parser The account whose permission to route data was updated
    /// @param newBool Updated permission
    event SetCanRoute(
        address indexed owner,
        address indexed parser,
        bool indexed newBool
    );

    /// @notice Event emitted when the data is routed to add to a governance balance
    /// @param uuid Unique identifier of the routed data
    /// @param chain Type of blockchain associated with the routed event, i.e. "EVM"
    /// @param emiter The blockchain-specific address where the data event originated
    /// @param token The blockchain-specific token address
    /// @param sender The blockchain-specific address that sent the tokens
    /// @param receiver The blockchain-specific address to receive the tokens
    /// @param amount The amount of tokens
    event GTONAdd(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes token,
        bytes sender,
        bytes receiver,
        uint256 amount
    );

    /// @notice Event emitted when the data is routed to subtract from a governance balance
    /// @param uuid Unique identifier of the routed data
    /// @param chain Type of blockchain associated with the routed event, i.e. "EVM"
    /// @param emiter The blockchain-specific address where the data event originated
    /// @param token The blockchain-specific token address
    /// @param sender The blockchain-specific address that sent the tokens
    /// @param receiver The blockchain-specific address to receive the tokens
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
    /// @param amount The amount of tokens
    event LPAdd(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes token,
        bytes sender,
        bytes receiver,
        uint256 amount
    );

    /// @notice Event emitted when the data is routed to subtract from an lp-token balance
    /// @param uuid Unique identifier of the routed data
    /// @param chain Type of blockchain associated with the routed event, i.e. "EVM"
    /// @param emiter The blockchain-specific address where the data event originated
    /// @param token The blockchain-specific token address
    /// @param sender The blockchain-specific address that sent the tokens
    /// @param receiver The blockchain-specific address to receive the tokens
    /// @param amount The amount of tokens
    event LPSub(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes token,
        bytes sender,
        bytes receiver,
        uint256 amount
    );
}
