//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";
import "./IWETH.sol";
import "./IOracleRouterV2.sol";
import "./IUniswapV2Router01.sol";
import "./IUniswapV2Factory.sol";
import "./IUniswapV2Pair.sol";

/// @title The interface for Graviton relay contract
/// @notice Trades native tokens for gton to start crosschain swap,
/// trades gton for native tokens to compelete crosschain swap
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IRelay is IOracleRouterV2 {
    /// @notice ERC20 wrapped version of the native token
    function wnative() external view returns (IWETH);

    /// @notice UniswapV2 router
    function router() external view returns (IUniswapV2Router01);

    /// @notice relay token
    function gton() external view returns (IERC20);

    /// @notice chains for relay swaps to and from
    function isAllowedChain(string calldata chain) external view returns (bool);

    /// @notice allow/forbid chain to relay swap
    /// @param chain blockchain name, e.g. 'FTM', 'PLG'
    /// @param newBool new permission for the chain
    function setIsAllowedChain(string calldata chain, bool newBool) external;

    /// @notice minimum fee for a destination
    function feeMin(string calldata destination) external view returns (uint256);

    /// @notice percentage fee for a destination
    function feePercent(string calldata destination) external view returns (uint256);

    /// @notice Sets fees for a destination
    /// @param _feeMin Minimum fee
    /// @param _feePercent Percentage fee
    function setFees(string calldata destination, uint256 _feeMin, uint256 _feePercent) external;

    /// @notice minimum amount of native tokens allowed to swap
    function lowerLimit(string calldata destination) external view returns (uint256);

    /// @notice maximum amount of native tokens allowed to swap
    function upperLimit(string calldata destination) external view returns (uint256);

    /// @notice Sets limits for a destination
    /// @param _lowerLimit Minimum amount of native tokens allowed to swap
    /// @param _upperLimit Maximum amount of native tokens allowed to swap
    function setLimits(string calldata destination, uint256 _lowerLimit, uint256 _upperLimit) external;

    /// @notice topic0 of the event associated with initiating a relay transfer
    function relayTopic() external view returns (bytes32);

    /// @notice Sets topic0 of the event associated with initiating a relay transfer
    function setRelayTopic(bytes32 _relayTopic) external;

    /// @notice Trades native tokens for relay, takes fees,
    /// emits event to start crosschain transfer
    /// @param destination The blockchain that will receive native tokens
    /// @param receiver The account that will receive native tokens
    function lock(string calldata destination, bytes calldata receiver) external payable;

    /// @notice Transfers locked ERC20 tokens to owner
    function reclaimERC20(IERC20 token, uint256 amount) external;

    /// @notice Transfers locked native tokens to owner
    function reclaimNative(uint256 amount) external;

    /// @notice Event emitted when native tokens equivalent to
    /// `amount` of relay tokens are locked via `#lock`
    /// @dev Oracles read this event and unlock
    /// equivalent amount of native tokens on the destination chain
    /// @param destinationHash The blockchain that will receive native tokens
    /// @dev indexed string returns keccak256 of the value
    /// @param receiverHash The account that will receive native tokens
    /// @dev indexed bytes returns keccak256 of the value
    /// @param destination The blockchain that will receive native tokens
    /// @param receiver The account that will receive native tokens
    /// @param amount The amount of relay tokens equivalent to the
    /// amount of locked native tokens
    event Lock(
        string indexed destinationHash,
        bytes indexed receiverHash,
        string destination,
        bytes receiver,
        uint256 amount
    );

    /// @notice Event emitted when fees are calculated
    /// @param amountIn Native tokens sent to dex
    /// @param amountOut Relay tokens received on dex
    /// @param feeMin Minimum fee
    /// @param feePercent Percentage for the fee in %
    /// @dev precision 3 decimals
    /// @param fee Percentage fee in relay tokens
    /// @param amountMinusFee Relay tokens minus fees
    event CalculateFee(
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeMin,
        uint256 feePercent,
        uint256 fee,
        uint256 amountMinusFee
    );

    /// @notice Event emitted when the relay tokens are traded for
    /// `amount0` of gton swaped for native tokens via '#routeValue'
    /// `amount1` of native tokens sent to the `user` via '#routeValue'
    event DeliverRelay(address user, uint256 amount0, uint256 amount1);

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
    /// @param _feePercent Percentage fee
    event SetFees(string destination, uint256 _feeMin, uint256 _feePercent);

    /// @notice Event emitted when limits are set via '#setLimits'
    /// @param _lowerLimit Minimum fee
    /// @param _upperLimit Percentage fee
    event SetLimits(string destination, uint256 _lowerLimit, uint256 _upperLimit);
}
