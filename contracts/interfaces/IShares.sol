//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title The interface for Graviton Shares
/// @notice Tracks the shares of users in a farming campaign
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IShares {
    /// @notice User's share in the farming campaign
    function shareById(uint256 userId) external view returns (uint256);

    /// @notice The total number of shares in the farming campaign
    function totalShares() external view returns (uint256);

    /// @notice The total number of users in the farming campaign
    function totalUsers() external view returns (uint256);

    /// @notice Unique identifier of nth user
    function userIdByIndex(uint256 index) external view returns (uint256);
}
