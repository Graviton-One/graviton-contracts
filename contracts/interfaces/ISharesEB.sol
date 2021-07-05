//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IShares.sol";
import "./IBalanceKeeperV2.sol";
import "./IImpactKeeper.sol";

/// @title The interface for Graviton early birds shares
/// @notice Tracks shares of early birds
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface ISharesEB is IShares {
    /// @notice Address of the contract that tracks governance balances
    function balanceKeeper() external view returns (IBalanceKeeperV2);

    /// @notice Address of the contract that tracks early birds impact
    function impactEB() external view returns (IImpactKeeper);

    /// @notice Look up early birds share of `userId`
    function impactById(uint256 userId) external view returns (uint256);

    /// @notice The total amount of early birds shares
    function totalSupply() external view returns (uint256);

    /// @notice Index of the user to migrate early birds impact
    function currentUser() external view returns (uint256);

    /// @notice Copies impact data for `step` users from the previous early birds contract
    function migrate(uint256 step) external;

    /// @notice Event emitted when data is routed
    /// @param user Address of the user whose impact was migrated
    /// @param userId Unique id of the user whose impact was migrated
    /// @param impact The amount of stable coins the user deposited in the early birds campaign
    event Migrate(address indexed user, uint256 indexed userId, uint256 impact);
}
