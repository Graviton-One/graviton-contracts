//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IShares.sol";

/// @title The interface for Graviton balance keeper
/// @notice BalanceKeeper tracks governance balance of users
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IBalanceKeeperV2 is IShares {
    /// @notice User that can grant access permissions and perform privileged actions
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    function setOwner(address _owner) external;

    /// @notice Look up if `user` is allowed to open new governance balances
    function canOpen(address user) external view returns (bool);

    /// @notice Look up if `user` is allowed to add to governance balances
    function canAdd(address user) external view returns (bool);

    /// @notice Look up if `user` is allowed to subtract from governance balances
    function canSubtract(address user) external view returns (bool);

    /// @notice Sets `opener` permission to open new governance balances to `_canOpen`
    /// @dev Can only be called by the current owner.
    function setCanOpen(address opener, bool _canOpen) external;

    /// @notice Sets `adder` permission to open new governance balances to `_canAdd`
    /// @dev Can only be called by the current owner.
    function setCanAdd(address adder, bool _canAdd) external;

    /// @notice Sets `subtractor` permission to open new governance balances to `_canSubtract`
    /// @dev Can only be called by the current owner.
    function setCanSubtract(address subtractor, bool _canSubtract) external;

    /// @notice The number of open governance balances
    function totalUsers() external view returns (uint256);

    /// @notice The sum of all governance balances
    function totalBalance() external view returns (uint256);

    /// @notice Look up if the `userId` has an associated governance balance
    /// @param userId unique id of the user
    function isKnownUser(uint256 userId) external view returns (bool);

    /// @notice Look up if the blockchain-address pair has an associated governance balance
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    function isKnownUser(string calldata userChain, bytes calldata userAddress)
        external
        view
        returns (bool);

    /// @notice Look up the type of blockchain associated with `userId`
    /// @param userId unique id of the user
    function userChainById(uint256 userId)
        external
        view
        returns (string memory);

    /// @notice Look up the blockchain-specific address associated with `userId`
    /// @param userId unique id of the user
    function userAddressById(uint256 userId)
        external
        view
        returns (bytes calldata);

    /// @notice Look up the blockchain-address pair associated with `userId`
    /// @param userId unique id of the user
    function userChainAddressById(uint256 userId)
        external
        view
        returns (string calldata, bytes calldata);

    /// @notice Look up the unique id associated with the blockchain-address pair
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    function userIdByChainAddress(
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (uint256);

    /// @notice The amount of governance tokens owned by the user
    /// @param userId unique id of the user
    function balance(uint256 userId) external view returns (uint256);

    /// @notice The amount of governance tokens owned by the user
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    function balance(string calldata userChain, bytes calldata userAddress)
        external
        view
        returns (uint256);

    /// @notice Opens a new user governance balance associated with the blockchain-address pair
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    function open(string calldata userChain, bytes calldata userAddress)
        external;

    /// @notice Adds `amount` of governance tokens to the user balance
    /// @param userId unique id of the user
    /// @param amount the number of governance tokens
    function add(uint256 userId, uint256 amount) external;

    /// @notice Adds `amount` of governance tokens to the user balance
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @param amount the number of governance tokens
    function add(
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    /// @notice Subtracts `amount` of governance tokens from the user balance
    /// @param userId unique id of the user
    /// @param amount the number of governance tokens
    function subtract(uint256 userId, uint256 amount) external;

    /// @notice Subtracts `amount` of governance tokens from the user balance
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address
    /// @param amount the number of governance tokens
    function subtract(
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    /// @notice Event emitted when the owner changes via #setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    event SetOwner(address ownerOld, address ownerNew);

    /// @notice Event emitted when the `opener` permission is updated via `#setCanOpen`
    /// @param owner The owner account at the time of change
    /// @param opener The account whose permission to open governance balances was updated
    /// @param newBool Updated permission
    event SetCanOpen(
        address indexed owner,
        address indexed opener,
        bool indexed newBool
    );

    /// @notice Event emitted when the `adder` permission is updated via `#setCanAdd`
    /// @param owner The owner account at the time of change
    /// @param adder The account whose permission to add to governance balances was updated
    /// @param newBool Updated permission
    event SetCanAdd(
        address indexed owner,
        address indexed adder,
        bool indexed newBool
    );

    /// @notice Event emitted when the `subtractor` permission is updated via `#setCanSubtract`
    /// @param owner The owner account at the time of change
    /// @param subtractor The account whose permission
    /// to subtract from governance balances was updated
    /// @param newBool Updated permission
    event SetCanSubtract(
        address indexed owner,
        address indexed subtractor,
        bool indexed newBool
    );

    /// @notice Event emitted when the `amount` of governance tokens
    /// is added to `userId` balance via `#add`
    /// @param adder The account that added to the balance
    /// @param userId The account whose governance balance was updated
    /// @param amount The amount of governance tokens
    event Add(address indexed adder, uint256 indexed userId, uint256 amount);

    /// @notice Event emitted when the `amount` of governance tokens
    /// is subtracted from `userId` balance via `#subtract`
    /// @param subtractor The account that subtracted from the balance
    /// @param userId The account whose governance balance was updated
    /// @param amount The amount of governance token
    event Subtract(
        address indexed subtractor,
        uint256 indexed userId,
        uint256 amount
    );
}
