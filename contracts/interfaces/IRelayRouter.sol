//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IOracleRouterV2.sol";
import "./IWETH.sol";
import "./IUniswapV2Router01.sol";
import "./IUniswapV2Factory.sol";
import "./IUniswapV2Pair.sol";
import "./IERC20.sol";

interface IRelayRouter is IOracleRouterV2 {

    /// @notice Address that holds relay tokens
    function wallet() external view returns (address);

    /// @notice Sets the address that holds relay tokens
    function setWallet(address _wallet) external;

    /// @notice relay token
    function gton() external view returns (IERC20);

    /// @notice ERC20 wrapped version of the native token
    function wnative() external view returns (IWETH);

    /// @notice UniswapV2 router
    function router() external view returns (IUniswapV2Router01);

    /// @notice topic0 of the event associated with initiating a relay transfer
    function relayTopic() external view returns (bytes32);

    /// @notice Sets topic0 of the event associated with initiating a relay transfer
    function setRelayTopic(bytes32 _relayTopic) external;

    /// @notice Event emitted when the relay tokens are traded for
    /// `amount` of native tokens and are sent to the `user` via '#routeValue'
    event DeliverRelay(address user, uint256 amount);

    /// @notice Event emitted when the RelayTopic is set via '#setRelayTopic'
    /// @param topicOld The previous topic
    /// @param topicNew The new topic
    event SetRelayTopic(bytes32 indexed topicOld, bytes32 indexed topicNew);

    /// @notice Event emitted when the wallet is set via '#setWallet'
    /// @param walletOld The previous wallet address
    /// @param walletNew The new wallet address
    event SetWallet(address indexed walletOld, address indexed walletNew);
}
