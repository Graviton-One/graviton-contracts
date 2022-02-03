//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IFarm.sol";
import "./IBalanceKeeperV2.sol";
import "./ILPKeeperV2.sol";

/// @title The interface for Graviton balance adder
/// @notice BalanceAdder adds governance balance to users
/// proportional to their shares of locked lp
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IReflectionFarmingBalanceAdder {
    /// @notice Event emitted when the owner changes via `#setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    /// @dev 0xcbf985117192c8f614a58aaf97226bb80a754772f5f6edf06f87c675f2e6c663
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    event SetFarm(IFarm indexed farmOld, IFarm indexed farmNew);

    /// @notice Event emitted when the `parser` permission is updated via `#setCanRoute`
    /// @param owner The owner account at the time of change
    /// @param parser The account whose permission to route data was updated
    /// @param newBool Updated permission
    event SetCanRoute(
        address indexed owner,
        address indexed parser,
        bool indexed newBool
    );

    event SetImpact(bytes token, uint256 impact, uint256 totalImpact);

    /// @notice Event emitted when balances are processed for a farm via `#processBalances`
    /// @param farm The contract that calculates funds available for the farming campaign
    /// @param step Number of users to process
    /// @dev
    event ProcessBalances(IFarm indexed farm, uint256 step);

    /// @notice Event emitted when balances are processed for a farm via `#processBalances`
    /// @param shares The contract that stores user shares in the farming campaign
    /// @param farm The contract that calculates funds available for the farming campaign
    /// @param userId unique id of the user
    /// @param amount The amount of governance tokens added to user's governance balance
    /// @dev
    event ProcessBalance(
        uint256 farmIndex,
        bytes indexed shares,
        IFarm indexed farm,
        uint256 indexed userId,
        uint256 amount
    );
}
