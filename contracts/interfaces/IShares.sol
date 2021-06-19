//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title The interface for Graviton Shares
/// @notice Shares tracks the shares of users in a farming campaign
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IShares {
    /// @notice User's share in the farming campaign
    function shareById(uint256 userId) external returns (uint256);

    /// @notice The total number of shares in the farming campaign
    function totalShares() external returns (uint256);
}
