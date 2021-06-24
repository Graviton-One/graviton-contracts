//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IShares.sol";
import "./IFarm.sol";
import "./IBalanceKeeperV2.sol";

/// @title The interface for Graviton balance adder
/// @notice BalanceAdder adds governance balance to users according to farming campaigns
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IBalanceAdderV2 {
    /// @notice User that can grant access permissions and perform privileged actions
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    function setOwner(address _owner) external;

    /// @notice Contract that stores governance balance of users
    function balanceKeeper() external view returns (IBalanceKeeperV2);

    /// @notice Look up the contract that stores user shares in the `farmIndex` farming campaign
    function shares(uint256 farmIndex) external view returns (IShares);

    /// @notice Look up the contract that calculates funds available for the `farmIndex` farming campaign
    function farms(uint256 farmIndex) external view returns (IFarm);

    /// @notice Look up the amount of funds already distributed for the `farmIndex` farming campaign
    function lastPortions(uint256 farmIndex) external view returns (uint256);

    /// @notice Id of the user to receive funds in the current farming campaign
    /// @dev When current user is 0, campaign has not started processing
    /// @dev When processing is finished, current user is set to 0
    function currentUser() external view returns (uint256);

    /// @notice Id of the farming campaign to process
    function currentFarm() external view returns (uint256);

    /// @notice Portion of funds to distribute in processing on this round
    function currentPortion() external view returns (uint256);

    /// @notice Total funds available for the farming campaign
    function totalUnlocked() external view returns (uint256);

    /// @notice The sum of governance balances of all users
    function totalBalance() external view returns (uint256);

    /// @notice Look up if the `farmIndex` farming campaign is being processed
    /// @return true if the farming campaign is locked for processing,
    /// false if the current farm has not started processing
    function isProcessing(uint256 farmIndex) external view returns (bool);

    /// @notice The number of active farming campaigns
    function totalFarms() external view returns (uint256);

    /// @notice The number of users known to BalanceKeeper
    function totalUsers() external view returns (uint256);

    /// @notice Adds shares, farm and initialize lastPortions
    /// for the new farming campaign
    /// @param _share The contract that stores user shares in the farming campaign
    /// @param _farm The contract that calculates funds available for the farming campaign
    function addFarm(IShares _share, IFarm _farm) external;

    /// @notice Removes shares, farm and lastPortions for the new farming campaign
    /// @dev changes ids of farms that follow `farmIndex` in the array
    function removeFarm(uint256 farmIndex) external;

    /// @notice Adds balances to `step` of users according to current farming campaign
    /// @dev iterates over all users and then increments current farm index
    function processBalances(uint256 step) external;

    /// @notice Event emitted when the owner changes via `#setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    /// @notice Event emitted when a farm is added via `#addFarm`
    /// @param _shares The contract that stores user shares in the farming campaign
    /// @param _farm The contract that calculates funds available for the farming campaign
    event AddFarm(uint farmIndex, IShares indexed _shares, IFarm indexed _farm);

    /// @notice Event emitted when a farm is removed via `#removeFarm`
    /// @param oldShares The contract that stores user shares in the farming campaign
    /// @param oldFarm The contract that calculates funds available for the farming campaign
    /// @param oldLastPortions The portions processed in the farm before it was removed
    event RemoveFarm(uint farmIndex, IShares indexed oldShares, IFarm indexed oldFarm, uint oldLastPortions);

    /// @notice Event emitted when balances are processed for a farm via `#processBalances`
    /// @param oldShares The contract that stores user shares in the farming campaign
    /// @param oldFarm The contract that calculates funds available for the farming campaign
    /// @param step Number of users to process
    event ProcessBalances(uint farmIndex, IShares indexed oldShares, IFarm indexed oldFarm, uint step);

    /// @notice Event emitted when balances are processed for a farm via `#processBalances`
    /// @param oldShares The contract that stores user shares in the farming campaign
    /// @param oldFarm The contract that calculates funds available for the farming campaign
    /// @param userId unique id of the user
    /// @param amount The amount of governance tokens added to user's governance balance
    event ProcessBalance(uint farmIndex, IShares indexed oldShares, IFarm indexed oldFarm, uint indexed userId, uint amount);
}
