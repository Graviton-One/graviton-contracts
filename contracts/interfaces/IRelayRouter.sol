//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IOracleRouterV2.sol";
import "./IWETH.sol";
import "./IUniswapV2Router01.sol";
import "./IUniswapV2Factory.sol";
import "./IUniswapV2Pair.sol";
import "./IERC20.sol";

interface IRelayRouter is IOracleRouterV2 {
    function relayTopic() external view returns (bytes32);

    function wallet() external view returns (address);

    function gton() external view returns (IERC20);

    function wnative() external view returns (IWETH);

    function router() external view returns (IUniswapV2Router01);

    function setWallet(address _wallet) external;

    function setRelayTopic(bytes32 _relayTopic) external;

    event DeliverRelay(address user, uint256 amount);

    event SetRelayTopic(bytes32 topicOld, bytes32 topicNew);

    event SetWallet(address walletOld, address walletNew);
}
