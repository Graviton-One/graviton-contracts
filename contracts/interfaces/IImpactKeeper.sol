//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title The interface for Graviton impact keeper
/// @notice Tracks the amount of stable coins deposited in the early birds campaign
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IImpactKeeper {
    /// @notice The amount of stable coins that `user` deposited in the early birds campaign
    function impact(address user) external returns (uint256);

    /// @notice The total amount of stable coins deposited in the early birds campaign
    function totalSupply() external returns (uint256);

    /// @notice Look up the address of the user
    /// @param id index of the user
    function users(uint256 id) external returns (address);

    /// @notice The number of users in the early birds campaign
    function userCount() external returns (uint256);
}
