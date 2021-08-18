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
    /// @dev 0x8da5cb5b
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    /// @dev 0x13af4035
    function setOwner(address _owner) external;

    /// @notice Contract that stores governance balance of users
    /// @dev 0xfd44f921
    function balanceKeeper() external view returns (IBalanceKeeperV2);

    /// @notice Look up the contract that stores user shares in the `farmIndex` farming campaign
    /// @dev 0x57a858fc
    function shares(uint256 farmIndex) external view returns (IShares);

    /// @notice Look up the contract that calculates funds available for the `farmIndex` farming campaign
    /// @dev 0x7da470ea
    function farms(uint256 farmIndex) external view returns (IFarm);

    /// @notice Look up the amount of funds already distributed for the `farmIndex` farming campaign
    /// @dev 0x2a433aae
    function lastPortions(uint256 farmIndex) external view returns (uint256);

    /// @notice Id of the user to receive funds in the current farming campaign
    /// @dev When current user is 0, campaign has not started processing
    /// @dev When processing is finished, current user is set to 0
    /// @dev 0x92ee0334
    function currentUser() external view returns (uint256);

    /// @notice Id of the farming campaign to process
    /// @dev 0x7a42a865
    function currentFarm() external view returns (uint256);

    /// @notice Portion of funds to distribute in processing on this round
    /// @dev 0x12ccc301
    function currentPortion() external view returns (uint256);

    /// @notice Total funds available for the farming campaign
    /// @dev 0xa779d080
    function totalUnlocked() external view returns (uint256);

    /// @notice The sum of shares of all users
    /// @dev 0x3a98ef39
    function totalShares() external view returns (uint256);

    /// @notice Look up if the `farmIndex` farming campaign is being processed
    /// @return true if the farming campaign is locked for processing,
    /// false if the current farm has not started processing
    /// @dev 0x5b0342f1
    function isProcessing(uint256 farmIndex) external view returns (bool);

    /// @notice The number of active farming campaigns
    /// @dev 0x4c995a7f
    function totalFarms() external view returns (uint256);

    /// @notice The number of users known to BalanceKeeper
    /// @dev 0xbff1f9e1
    function totalUsers() external view returns (uint256);

    /// @notice Adds shares, farm and initialize lastPortions
    /// for the new farming campaign
    /// @param _share The contract that stores user shares in the farming campaign
    /// @param _farm The contract that calculates funds available for the farming campaign
    /// @param _lastPortions The portions processed in the farm before it was added
    /// @dev 0x09ca83e4
    function addFarm(IShares _share, IFarm _farm, uint256 _lastPortions) external;

    /// @notice Removes shares, farm and lastPortions for the new farming campaign
    /// @dev changes ids of farms that follow `farmIndex` in the array
    /// @dev 0x42a7579d
    function removeFarm(uint256 farmIndex) external;

    /// @notice Adds balances to `step` of users according to current farming campaign
    /// @dev iterates over all users and then increments current farm index
    /// @dev 0x1a5b5a14
    function processBalances(uint256 step) external;

    /// @notice Event emitted when the owner changes via `#setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    /// @dev 0xcbf985117192c8f614a58aaf97226bb80a754772f5f6edf06f87c675f2e6c663
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    /// @notice Event emitted when a farm is added via `#addFarm`
    /// @param _shares The contract that stores user shares in the farming campaign
    /// @param _farm The contract that calculates funds available for the farming campaign
    /// @param _lastPortions The portions processed in the farm before it was added
    /// @dev 0xc4c7aeb041ac2d1bd75b368a05edc2ea5f1b222e050bbbe91c735d074d8583f8
    event AddFarm(
        uint256 farmIndex,
        IShares indexed _shares,
        IFarm indexed _farm,
        uint256 _lastPortions
    );

    /// @notice Event emitted when a farm is removed via `#removeFarm`
    /// @param oldShares The contract that stores user shares in the farming campaign
    /// @param oldFarm The contract that calculates funds available for the farming campaign
    /// @param oldLastPortions The portions processed in the farm before it was removed
    /// @dev 0x084f61398b65df2c019793a91ca836dafcd56ac22adf2cc501c98e44665457da
    event RemoveFarm(
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
