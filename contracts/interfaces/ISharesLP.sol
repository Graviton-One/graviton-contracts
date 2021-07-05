//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IShares.sol";
import "./ILPKeeperV2.sol";

/// @title The interface for Graviton lp-token shares
/// @notice Tracks shares of locked lp-tokens
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface ISharesLP is IShares {
    /// @notice Address of the contract that tracks lp-token balances
    function lpKeeper() external view returns (ILPKeeperV2);

    /// @notice Unique id of the lp-token for which to track user shares
    function tokenId() external view returns (uint256);
}
