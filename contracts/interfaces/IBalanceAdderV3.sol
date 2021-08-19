//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IShares.sol";
import "./IFarm.sol";
import "./IBalanceKeeperV2.sol";

/// @title The interface for Graviton balance adder
/// @notice BalanceAdder adds governance balance to users according to farming campaigns
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IBalanceAdderV3 {

    /// @notice Event emitted when the owner changes via `#setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    /// @dev 0xcbf985117192c8f614a58aaf97226bb80a754772f5f6edf06f87c675f2e6c663
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    /// @notice Event emitted when a farm is added via `#addFarm`
    /// @param _shares The contract that stores user shares in the farming campaign
    /// @param _farm The contract that calculates funds available for the farming campaign
    /// @param _lastPortions The portions processed in the farm before it was added
    /// @dev
    event AddCampaign(
        uint256 farmIndex,
        IShares indexed _shares,
        IFarm indexed _farm,
        uint256 _lastPortions
    );

    /// @notice Event emitted when a farm is removed via `#removeFarm`
    /// @param oldShares The contract that stores user shares in the farming campaign
    /// @param oldFarm The contract that calculates funds available for the farming campaign
    /// @param oldLastPortions The portions processed in the farm before it was removed
    /// @dev
    event RemoveCampaign(
        uint256 farmIndex,
        IShares indexed oldShares,
        IFarm indexed oldFarm,
        uint256 oldLastPortions
    );

    /// @notice Event emitted when balances are processed for a farm via `#processBalances`
    /// @param oldShares The contract that stores user shares in the farming campaign
    /// @param oldFarm The contract that calculates funds available for the farming campaign
    /// @param step Number of users to process
    /// @dev 0x58daf0f3614604151fd17c5915e68241308b3404ac4c96a3af636acd06b3e4df
    event ProcessBalances(
        uint256 farmIndex,
        IShares indexed oldShares,
        IFarm indexed oldFarm,
        uint256 step
    );

    /// @notice Event emitted when balances are processed for a farm via `#processBalances`
    /// @param oldShares The contract that stores user shares in the farming campaign
    /// @param oldFarm The contract that calculates funds available for the farming campaign
    /// @param userId unique id of the user
    /// @param amount The amount of governance tokens added to user's governance balance
    /// @dev 0x67da84f1d8d6e06e895499674121e08e062f1f9ff352d9913338ad9b6c30a47a
    event ProcessBalance(
        uint256 farmIndex,
        IShares indexed oldShares,
        IFarm indexed oldFarm,
        uint256 indexed userId,
        uint256 amount
    );
}
