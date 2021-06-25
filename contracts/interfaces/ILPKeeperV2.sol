//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IBalanceKeeperV2.sol";

/// @title The interface for Graviton lp-token keeper
/// @notice Tracks the amount of locked liquidity provision tokens for each user
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface ILPKeeperV2 {
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

    /// @notice Address of the contract that tracks governance balances
    function balanceKeeper() external view returns (IBalanceKeeperV2);

    /// @notice The number of lp-tokens
    function totalTokens() external view returns (uint256);

    /// @notice Look up if the `tokenId` has an associated set of user balances
    /// @param tokenId unique id of the token
    function isKnownToken(uint256 tokenId) external view returns (bool);

    /// @notice Look up if the blockchain-address pair has an associated set of user balances
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    function isKnownToken(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (bool);

    /// @notice Look up the type of blockchain associated with `tokenId`
    /// @param tokenId unique id of the token
    function tokenChainById(uint256 tokenId)
        external
        view
        returns (string calldata);

    /// @notice Look up the blockchain-specific address associated with `tokenId`
    /// @param tokenId unique id of the token
    function tokenAddressById(uint256 tokenId)
        external
        view
        returns (bytes calldata);

    /// @notice Look up the blockchain-address pair associated with `tokenId`
    /// @param tokenId unique id of the token
    function tokenChainAddressById(uint256 tokenId)
        external
        view
        returns (string calldata, bytes calldata);

    /// @notice Look up the unique id associated with the blockchain-address pair
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    function tokenIdByChainAddress(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (uint256);

    /// @notice Look up the unique id of the user associated with `userIndex` in the token
    /// @param tokenId unique id of the token
    function tokenUser(uint256 tokenId, uint256 userIndex)
        external
        view
        returns (uint256);

    /// @notice Look up the unique id of the user associated with `userIndex` in the token
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    function tokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userIndex
    ) external view returns (uint256);

    /// @notice Look up if the user has an associated balance of the lp-token
    /// @param tokenId unique id of the token
    /// @param userId unique id of the user
    function isKnownTokenUser(uint256 tokenId, uint256 userId)
        external
        view
        returns (bool);

    /// @notice Look up if the user has an associated balance of the lp-token
    /// @param tokenId unique id of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    function isKnownTokenUser(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (bool);

    /// @notice Look up if the user has an associated balance of the lp-token
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @param userId unique id of the user
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
    function isKnownTokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (bool);

    /// @notice The number of users that have associated balances of the lp-token
    /// @param tokenId unique id of the token
    function totalTokenUsers(uint256 tokenId) external view returns (uint256);

    /// @notice The number of users that have associated balances of the lp-token
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    function totalTokenUsers(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (uint256);

    /// @notice The amount of lp-tokens locked by the user
    /// @param tokenId unique id of the token
    /// @param userId unique id of the user
    function balance(uint256 tokenId, uint256 userId)
        external
        view
        returns (uint256);

    /// @notice The amount of lp-tokens locked by the user
    /// @param tokenId unique id of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
    function balance(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (uint256);

    /// @notice The amount of lp-tokens locked by the user
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    /// @param userId unique id of the user
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
    function balance(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (uint256);

    /// @notice The total amount of lp-tokens of a given type locked by the users
    /// @param tokenId unique id of the token
    function totalBalance(uint256 tokenId) external view returns (uint256);

    /// @notice The total amount of lp-tokens of a given type locked by the users
    /// @param tokenChain the type of blockchain that the token address belongs to, i.e "EVM"
    /// @param tokenAddress blockchain-specific address of the token
    function totalBalance(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (uint256);

    /// @notice Opens a set of user balances for the lp-token
    /// associated with the blockchain-address pair
    function open(string calldata tokenChain, bytes calldata tokenAddress)
        external;

    /// @notice Adds `amount` of lp-tokens to the user balance
    /// @param tokenId unique id of the token
    /// @param userId unique id of the user
    function add(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) external;

    /// @notice Adds `amount` of lp-tokens to the user balance
    /// @param tokenId unique id of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
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
    function subtract(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) external;

    /// @notice Subtracts `amount` of lp-tokens from the user balance
    /// @param tokenId unique id of the token
    /// @param userChain the type of blockchain that the user address belongs to, i.e "EVM"
    /// @param userAddress blockchain-specific address of the user
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
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    /// @notice Event emitted when the `opener` permission is updated via `#setCanOpen`
    /// @param owner The owner account at the time of change
    /// @param opener The account whose permission to open token balances was updated
    /// @param newBool Updated permission
    event SetCanOpen(
        address indexed owner,
        address indexed opener,
        bool indexed newBool
    );

    /// @notice Event emitted when the `adder` permission is updated via `#setCanAdd`
    /// @param owner The owner account at the time of change
    /// @param adder The account whose permission to add to lp-token balances was updated
    /// @param newBool Updated permission
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
    event SetCanSubtract(
        address indexed owner,
        address indexed subtractor,
        bool indexed newBool
    );

    /// @notice Event emitted when the `amount` of `tokenId` lp-tokens
    /// is added to `userId` balance via `#add`
    /// @param adder The account that added to the balance
    /// @param tokenId The lp-token that was added
    /// @param userId The account whose lp-token balance was updated
    /// @param amount The amount of lp-tokens
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
    event Subtract(
        address indexed subtractor,
        uint256 indexed tokenId,
        uint256 indexed userId,
        uint256 amount
    );
}
