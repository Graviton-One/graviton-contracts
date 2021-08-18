//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IBalanceKeeperV2.sol";

/// @title The interface for Graviton lp-token keeper
/// @notice Tracks the amount of locked liquidity provision tokens for each user
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface ILPKeeperV2 {
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

    /// @notice Address of the contract that tracks governance balances
    /// @dev 0xfd44f921
    function balanceKeeper() external view returns (IBalanceKeeperV2);

    /// @notice The number of lp-tokens
    /// @dev 0x7e1c0c09
    function totalTokens() external view returns (uint256);

    /// @notice Look up if the `tokenId` has an associated set of user balances
    /// @param tokenId unique id of the token
    /// @dev 0x7315bbd5
    function isKnownToken(uint256 tokenId) external view returns (bool);

    /// @notice Look up if the blockchain-address pair has an associated set of user balances
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @dev 0xaab27467
    function isKnownToken(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (bool);

    /// @notice Look up the type of blockchain associated with `tokenId`
    /// @param tokenId unique id of the token
    /// @dev 0x7ac05698
    function tokenChainById(uint256 tokenId)
        external
        view
        returns (string calldata);

    /// @notice Look up the blockchain-specific address associated with `tokenId`
    /// @param tokenId unique id of the token
    /// @dev 0xde952a09
    function tokenAddressById(uint256 tokenId)
        external
        view
        returns (bytes calldata);

    /// @notice Look up the blockchain-address pair associated with `tokenId`
    /// @param tokenId unique id of the token
    /// @dev 0x57dc6209
    function tokenChainAddressById(uint256 tokenId)
        external
        view
        returns (string calldata, bytes calldata);

    /// @notice Look up the unique id associated with the blockchain-address pair
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @dev 0xb30b3245
    function tokenIdByChainAddress(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (uint256);

    /// @notice Look up the unique id of the user associated with `userIndex` in the token
    /// @param tokenId unique id of the token
    /// @dev 0x187c459a
    function tokenUser(uint256 tokenId, uint256 userIndex)
        external
        view
        returns (uint256);

    /// @notice Look up the unique id of the user associated with `userIndex` in the token
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @dev 0x19f56b71
    function tokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userIndex
    ) external view returns (uint256);

    /// @notice Look up if the user has an associated balance of the lp-token
    /// @param tokenId unique id of the token
    /// @param userId unique id of the user
    /// @dev 0x47dcbaa2
    function isKnownTokenUser(uint256 tokenId, uint256 userId)
        external
        view
        returns (bool);

    /// @notice Look up if the user has an associated balance of the lp-token
    /// @param tokenId unique id of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0x5682ce8c
    function isKnownTokenUser(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (bool);

    /// @notice Look up if the user has an associated balance of the lp-token
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @param userId unique id of the user
    /// @dev 0x5180602f
    function isKnownTokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId
    ) external view returns (bool);

    /// @notice Look up if the user has an associated balance of the lp-token
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0xfe3d2a5d
    function isKnownTokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (bool);

    /// @notice The number of users that have associated balances of the lp-token
    /// @param tokenId unique id of the token
    /// @dev 0x211d9154
    function totalTokenUsers(uint256 tokenId) external view returns (uint256);

    /// @notice The number of users that have associated balances of the lp-token
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @dev 0x544d189f
    function totalTokenUsers(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (uint256);

    /// @notice The amount of lp-tokens locked by the user
    /// @param tokenId unique id of the token
    /// @param userId unique id of the user
    /// @dev 0x94813dd1
    function balance(uint256 tokenId, uint256 userId)
        external
        view
        returns (uint256);

    /// @notice The amount of lp-tokens locked by the user
    /// @param tokenId unique id of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0x90d6a941
    function balance(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (uint256);

    /// @notice The amount of lp-tokens locked by the user
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @param userId unique id of the user
    /// @dev 0x074c9750
    function balance(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId
    ) external view returns (uint256);

    /// @notice The amount of lp-tokens locked by the user
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0xea4ee101
    function balance(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (uint256);

    /// @notice The total amount of lp-tokens of a given type locked by the users
    /// @param tokenId unique id of the token
    /// @dev 0xb7201c83
    function totalBalance(uint256 tokenId) external view returns (uint256);

    /// @notice The total amount of lp-tokens of a given type locked by the users
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @dev 0x16c4faa8
    function totalBalance(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (uint256);

    /// @notice Opens a set of user balances for the lp-token
    /// associated with the blockchain-address pair
    /// @dev 0xd41ebce1
    function open(string calldata tokenChain, bytes calldata tokenAddress)
        external;

    /// @notice Adds `amount` of lp-tokens to the user balance
    /// @param tokenId unique id of the token
    /// @param userId unique id of the user
    /// @dev 0x505fb46c
    function add(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) external;

    /// @notice Adds `amount` of lp-tokens to the user balance
    /// @param tokenId unique id of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0x1a1679e7
    function add(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    /// @notice Adds `amount` of lp-tokens to the user balance
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @param userId unique id of the user
    /// @dev 0x62882f4b
    function add(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId,
        uint256 amount
    ) external;

    /// @notice Adds `amount` of lp-tokens to the user balance
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0xa3a49296
    function add(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    /// @notice Subtracts `amount` of lp-tokens from the user balance
    /// @param tokenId unique id of the token
    /// @param userId unique id of the user
    /// @dev 0x7f9b8dd4
    function subtract(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) external;

    /// @notice Subtracts `amount` of lp-tokens from the user balance
    /// @param tokenId unique id of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0xb48ffdb9
    function subtract(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    /// @notice Subtracts `amount` of lp-tokens from the user balance
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @param userId unique id of the user
    /// @dev 0x2daf5799
    function subtract(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId,
        uint256 amount
    ) external;

    /// @notice Subtracts `amount` of lp-tokens from the user balance
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    /// @dev 0x5f2ecbb2
    function subtract(
        string calldata tokenChain,
        bytes calldata tokenAddress,
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
    /// @param opener The account whose permission to open token balances was updated
    /// @param newBool Updated permission
    /// @dev 0x1317484b2184978eae33164465cb4df6d4e79982c6516a36ec4ada226eb1d345
    event SetCanOpen(
        address indexed owner,
        address indexed opener,
        bool indexed newBool
    );

    /// @notice Event emitted when the `adder` permission is updated via `#setCanAdd`
    /// @param owner The owner account at the time of change
    /// @param adder The account whose permission to add to lp-token balances was updated
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
    /// to subtract from lp-token balances was updated
    /// @param newBool Updated permission
    /// @dev 0xc954f3ae852ebf9ca68e929d8e491727fcd9893a8c84c053fcf2a2637b8d5000
    event SetCanSubtract(
        address indexed owner,
        address indexed subtractor,
        bool indexed newBool
    );

    /// @notice Event emitted when a new `tokenId` is opened
    /// @param opener The account that opens `tokenId`
    /// @param tokenId The token account that was opened
    /// @dev 0x50042401acb675fedd6dd939fccc629832ce60fa4185df25c01b20e8def195bf
    event Open(address indexed opener, uint256 indexed tokenId);

    /// @notice Event emitted when the `amount` of `tokenId` lp-tokens
    /// is added to `userId` balance via `#add`
    /// @param adder The account that added to the balance
    /// @param tokenId The lp-token that was added
    /// @param userId The account whose lp-token balance was updated
    /// @param amount The amount of lp-tokens
    /// @dev 0xa2ba758028b7d21eee988892461f8630fe375441d69998d867174616c5eef8fb
    event Add(
        address indexed adder,
        uint256 indexed tokenId,
        uint256 indexed userId,
        uint256 amount
    );

    /// @notice Event emitted when the `amount` of `tokenId` lp-tokens
    /// is subtracted from `userId` balance via `#subtract`
    /// @param subtractor The account that subtracted from the balance
    /// @param tokenId The lp-token that was subtracted
    /// @param userId The account whose lp-token balance was updated
    /// @param amount The amount of lp-tokens
    /// @dev 0xb271e8aacff5df8ac4dd0fc1a4da3cc1d39edb125050765b9ed0e5103af9fa3c
    event Subtract(
        address indexed subtractor,
        uint256 indexed tokenId,
        uint256 indexed userId,
        uint256 amount
    );
}
