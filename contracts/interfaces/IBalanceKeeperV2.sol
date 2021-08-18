//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IShares.sol";

/// @title The interface for Graviton balance keeper
/// @notice BalanceKeeper tracks governance balance of users
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IBalanceKeeperV2 is IShares {
    /// @notice User that can grant access permissions and perform privileged actions
    /// @dev 0x8da5cb5b
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    /// @dev 0x13af4035
    function setOwner(address _owner) external;

    /// @notice Look up if `user` is allowed to open new governance balances
    /// @dev 0x9b2cf1a9
    function canOpen(address user) external view returns (bool);

    /// @notice Look up if `user` is allowed to add to governance balances
    /// @dev 0x289420c1
    function canAdd(address user) external view returns (bool);

    /// @notice Look up if `user` is allowed to subtract from governance balances
    /// @dev 0x5fe1c47e
    function canSubtract(address user) external view returns (bool);

    /// @notice Sets `opener` permission to open new governance balances to `_canOpen`
    /// @dev Can only be called by the current owner.
    /// @dev 0x05bc1030
    function setCanOpen(address opener, bool _canOpen) external;

    /// @notice Sets `adder` permission to open new governance balances to `_canAdd`
    /// @dev Can only be called by the current owner.
    /// @dev 0xe235cef2
    function setCanAdd(address adder, bool _canAdd) external;

    /// @notice Sets `subtractor` permission to open new governance balances to `_canSubtract`
    /// @dev Can only be called by the current owner.
    /// @dev 0x7241ef34
    function setCanSubtract(address subtractor, bool _canSubtract) external;

    /// @notice The number of open governance balances
    /// @dev 0xbff1f9e1
    function totalUsers() external view override returns (uint256);

    /// @notice The sum of all governance balances
    /// @dev 0xad7a672f
    function totalBalance() external view returns (uint256);

    /// @notice Look up if the `userId` has an associated governance balance
    /// @param userId unique id of the user
    /// @dev 0xe8e55018
    function isKnownUser(uint256 userId) external view returns (bool);

    /// @notice Look up if the blockchain-address pair has an associated governance balance
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0xf91c1e50
    function isKnownUser(string calldata userChain, bytes calldata userAddress)
        external
        view
        returns (bool);

    /// @notice Look up the type of blockchain associated with `userId`
    /// @param userId unique id of the user
    /// @dev 0xeaff261b
    function userChainById(uint256 userId)
        external
        view
        returns (string memory);

    /// @notice Look up the blockchain-specific address associated with `userId`
    /// @param userId unique id of the user
    /// @dev 0x4aed47cf
    function userAddressById(uint256 userId)
        external
        view
        returns (bytes calldata);

    /// @notice Look up the blockchain-address pair associated with `userId`
    /// @param userId unique id of the user
    /// @dev 0xece10876
    function userChainAddressById(uint256 userId)
        external
        view
        returns (string calldata, bytes calldata);

    /// @notice Look up the unique id associated with the blockchain-address pair
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0x3ed084c4
    function userIdByChainAddress(
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (uint256);

    /// @notice The amount of governance tokens owned by the user
    /// @param userId unique id of the user
    /// @dev 0x47bb89f0
    function balance(uint256 userId) external view returns (uint256);

    /// @notice The amount of governance tokens owned by the user
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0x3777d65a
    function balance(string calldata userChain, bytes calldata userAddress)
        external
        view
        returns (uint256);

    /// @notice Opens a new user governance balance associated with the blockchain-address pair
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0xd41ebce1
    function open(string calldata userChain, bytes calldata userAddress)
        external;

    /// @notice Adds `amount` of governance tokens to the user balance
    /// @param userId unique id of the user
    /// @param amount the number of governance tokens
    /// @dev 0x771602f7
    function add(uint256 userId, uint256 amount) external;

    /// @notice Adds `amount` of governance tokens to the user balance
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @param amount the number of governance tokens
    /// @dev 0x7ec8269e
    function add(
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    /// @notice Subtracts `amount` of governance tokens from the user balance
    /// @param userId unique id of the user
    /// @param amount the number of governance tokens
    /// @dev 0x3ef5e445
    function subtract(uint256 userId, uint256 amount) external;

    /// @notice Subtracts `amount` of governance tokens from the user balance
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address
    /// @param amount the number of governance tokens
    /// @dev 0x22bde2bb
    function subtract(
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    /// @notice Event emitted when the owner changes via `#setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    /// @dev 0xcbf985117192c8f614a58aaf97226bb80a754772f5f6edf06f87c675f2e6c663
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    /// @notice Event emitted when the `opener` permission is updated via `#setCanOpen`
    /// @param owner The owner account at the time of change
    /// @param opener The account whose permission to open governance balances was updated
    /// @param newBool Updated permission
    /// @dev 0x1317484b2184978eae33164465cb4df6d4e79982c6516a36ec4ada226eb1d345
    event SetCanOpen(
        address indexed owner,
        address indexed opener,
        bool indexed newBool
    );

    /// @notice Event emitted when the `adder` permission is updated via `#setCanAdd`
    /// @param owner The owner account at the time of change
    /// @param adder The account whose permission to add to governance balances was updated
    /// @param newBool Updated permission
    /// @dev 0xcfc65705d7d3022a56eae794c52cdedeac637251211c8c3345af78eee9cbe546
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
    /// @dev 0xc954f3ae852ebf9ca68e929d8e491727fcd9893a8c84c053fcf2a2637b8d5000
    event SetCanSubtract(
        address indexed owner,
        address indexed subtractor,
        bool indexed newBool
    );

    /// @notice Event emitted when a new `userId` is opened
    /// @param opener The account that opens `userId`
    /// @param userId The user account that was opened
    /// @dev 0x50042401acb675fedd6dd939fccc629832ce60fa4185df25c01b20e8def195bf
    event Open(address indexed opener, uint256 indexed userId);

    /// @notice Event emitted when the `amount` of governance tokens
    /// is added to `userId` balance via `#add`
    /// @param adder The account that added to the balance
    /// @param userId The account whose governance balance was updated
    /// @param amount The amount of governance tokens
    /// @dev 0xc264f49177bdbe55a01fae0e77c3fdc75d515d242b32bc4d56c565f5b47865ba
    event Add(address indexed adder, uint256 indexed userId, uint256 amount);

    /// @notice Event emitted when the `amount` of governance tokens
    /// is subtracted from `userId` balance via `#subtract`
    /// @param subtractor The account that subtracted from the balance
    /// @param userId The account whose governance balance was updated
    /// @param amount The amount of governance token
    /// @dev 0x47dd4a08dedb9e7afcf164b736d2a3fcaed9f9d56ec8d5e38aaafde8c22a58a7
    event Subtract(
        address indexed subtractor,
        uint256 indexed userId,
        uint256 amount
    );
}
