//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";
import "./IWETH.sol";
import "./IUniswapV2Router01.sol";
import "./IUniswapV2Factory.sol";
import "./IUniswapV2Pair.sol";
import "./ILogger.sol";

/// @title The interface for Graviton relay contract
/// @notice Trades native tokens for gton to start crosschain swap,
/// trades gton for native tokens to compelete crosschain swap
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IRelay {
    /// @dev feePercent is 5 decimals. ie. 30000 = 30%, 200 = 0.2%, 1 = 0.001%
    struct Chain {
        bool isAllowedChain;
        uint256 lowerLimit;
        uint256 upperLimit;
        uint256 feeMin;
        uint256 feeMax;
        uint256 feePercent;
    }

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

    /// @notice ERC20 wrapped version of the native token
    function wnative() external view returns (IWETH);

    /// @notice UniswapV2 router
    function router() external view returns (IUniswapV2Router01);

    /// @notice Logger
    /// @dev caches events to get them from contracts directly instead of getLogs
    function logger() external view returns (ILogger);

    /// @notice relay token
    function gton() external view returns (IERC20);

    /// @notice chains for relay swaps to and from
    // function isAllowedChain(string calldata chain) external view returns (bool);

    /// @notice allow/forbid chain to relay swap
    /// @param chain blockchain name, e.g. 'FTM', 'PLG'
    /// @param newBool new permission for the chain
    function setIsAllowedChain(string calldata chain, bool newBool) external;

    /// @notice Sets fees for a destination
    /// @param _feeMin Minimum fee
    /// @param _feeMax Maximum fee
    /// @param _feePercent Percentage fee
    function setFees(
        string calldata destination,
        uint256 _feeMin,
        uint256 _feeMax,
        uint256 _feePercent
    ) external;

    /// @notice Sets limits for a destination
    /// @param _lowerLimit Minimum amount of native tokens allowed to swap
    /// @param _upperLimit Maximum amount of native tokens allowed to swap
    function setLimits(
        string calldata destination,
        uint256 _lowerLimit,
        uint256 _upperLimit
    ) external;

    /// @notice chains for relay swaps to and from
    function chains(string calldata _chain)
        external
        view
        returns (
            bool isAllowedChain,
            uint256 lowerLimit,
            uint256 upperLimit,
            uint256 feeMin,
            uint256 feeMax,
            uint256 feePercent
        );

    function setChains(
        string[] memory _chains,
        uint256[3][] memory fees,
        uint256[2][] memory limits
    ) external;

    /// @notice Trades native tokens for relay, takes fees,
    /// emits event to start crosschain transfer
    /// @param destination The blockchain that will receive native tokens
    /// @param receiver The account that will receive native tokens
    function lock(string calldata destination, bytes calldata receiver)
        external
        payable;

    /// @notice Transfers locked ERC20 tokens to owner
    function reclaimERC20(IERC20 token, uint256 amount) external;

    /// @notice Transfers locked native tokens to owner
    function reclaimNative(uint256 amount) external;

    /// @notice Trades relay tokens for native
    /// emits event to complete crosschain transfer
    /// @param lockHash uniquish identifier
    /// @param origin _
    /// @param destination _
    /// @param sender _
    /// @param amountRelay _
    /// @param receiver receiver
    function unlock(
        bytes32 lockHash,
        string memory origin,
        string memory destination,
        bytes memory sender,
        uint256 amountRelay,
        bytes memory receiver
    ) external;

    /// @notice Event emitted when the owner changes via #setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    /// @notice Event emitted when the `parser` permission is updated via `#setCanRoute`
    /// @param owner The owner account at the time of change
    /// @param parser The account whose permission to route data was updated
    /// @param newBool Updated permission
    event SetCanRoute(
        address indexed owner,
        address indexed parser,
        bool indexed newBool
    );

    /// @notice Event emitted when the RelayTopic is set via '#setRelayTopic'
    /// @param topicOld The previous topic
    /// @param topicNew The new topic
    event SetRelayTopic(bytes32 indexed topicOld, bytes32 indexed topicNew);

    /// @notice Event emitted when the wallet is set via '#setWallet'
    /// @param walletOld The previous wallet address
    /// @param walletNew The new wallet address
    event SetWallet(address indexed walletOld, address indexed walletNew);

    /// @notice Event emitted when permission for a chain is set via '#setIsAllowedChain'
    /// @param chain Name of blockchain whose permission is changed, i.e. "FTM", "PLG"
    /// @param newBool Updated permission
    event SetIsAllowedChain(string chain, bool newBool);

    /// @notice Event emitted when fees are set via '#setFees'
    /// @param _feeMin Minimum fee
    /// @param _feeMax Maximum fee
    /// @param _feePercent Percentage fee
    event SetFees(
        string destination,
        uint256 _feeMin,
        uint256 _feeMax,
        uint256 _feePercent
    );

    /// @notice Event emitted when limits are set via '#setLimits'
    /// @param _lowerLimit Minimum fee
    /// @param _upperLimit Percentage fee
    event SetLimits(
        string destination,
        uint256 _lowerLimit,
        uint256 _upperLimit
    );

    /// @notice Event emitted when fees and limits are set via '#setChains'
    /// @param _chains chains
    /// @param fees fees
    /// @param limits limits
    event SetChains(string[] _chains, uint256[3][] fees, uint256[2][] limits);

    /// @notice Event emitted when fees are subtractd
    /// @param amountIn Native tokens sent to dex
    /// @param amountOut Relay tokens received on dex
    /// @param feeMin Minimum fee
    /// @param feeMax Maximum fee
    /// @param feePercent Percentage for the fee in %
    /// @dev precision 3 decimals
    /// @param fee Percentage fee in relay tokens
    /// @param amountMinusFee Relay tokens minus fees
    event SubtractFee(
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeMin,
        uint256 feeMax,
        uint256 feePercent,
        uint256 fee,
        uint256 amountMinusFee
    );

    /// @notice Event emitted when native tokens equivalent to
    /// `amount` of relay tokens are locked via `#lock`
    /// @dev Oracles read this event and unlock
    /// equivalent amount of native tokens on the destination chain
    /// @param lockHash uniquish identifier
    /// @param destinationHash The blockchain that will receive native tokens
    /// @dev indexed string returns keccak256 of the value
    /// @param origin The blockchain that will receive native tokens
    /// @param destination The blockchain that will receive native tokens
    /// @param sender The account that will receive native tokens
    /// @param amountLock The amount of relay tokens equivalent to the
    /// @param receiver The account that will receive native tokens
    /// @param amountRelay The amount of relay tokens equivalent to the
    /// amount of locked native tokens
    /// @dev 0x9ad6eaa2522e1b99d2c6a91200ab3c4d4c55cb9fcc3df859bb32b5b8818260fc
    event Lock(
        string indexed destinationHash,
        bytes32 indexed lockHash,
        string origin,
        string destination,
        bytes sender,
        uint256 amountLock,
        bytes receiver,
        uint256 amountRelay
    );

    /// @notice Event emitted when native tokens equivalent to
    /// `amount` of relay tokens are locked via `#lock`
    /// @param destinationHash The blockchain that will receive native tokens
    /// @dev indexed string returns keccak256 of the value
    /// @param senderHash The account that will receive native tokens
    /// @dev indexed bytes returns keccak256 of the value
    /// @param receiverHash The account that will receive native tokens
    /// @dev indexed bytes returns keccak256 of the value
    /// @param origin The blockchain that will receive native tokens
    /// @param destination The blockchain that will receive native tokens
    /// @param sender The account that will receive native tokens
    /// @param amountLock The amount of relay tokens equivalent to the
    /// @param receiver The account that will receive native tokens
    /// @param amountRelay The amount of relay tokens equivalent to the
    /// amount of locked native tokens
    /// @dev 0xc45d32a994cb2a134304b3d4dbf2fb0754deac601361121a4a5b3927bc89c21f
    event Lock_(
        string indexed destinationHash,
        bytes indexed senderHash,
        bytes indexed receiverHash,
        bytes32 lockHash,
        string origin,
        string destination,
        bytes sender,
        uint256 amountLock,
        bytes receiver,
        uint256 amountRelay
    );

    /// @notice Event emitted when native tokens equivalent to
    /// equivalent amount of native tokens and sent to
    event Unlock(
        string indexed originHash,
        bytes32 indexed lockHash,
        string origin,
        string destination,
        bytes sender,
        uint256 amountRelay,
        bytes receiver,
        uint256 amountUnlock
    );

    event Unlock_(
        string indexed originHash,
        bytes indexed senderHash,
        bytes indexed receiverHash,
        bytes32 lockHash,
        string origin,
        string destination,
        bytes sender,
        uint256 amountRelay,
        bytes receiver,
        uint256 amountUnlock
    );
}
