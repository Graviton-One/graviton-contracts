//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title The interface for Graviton farm
/// @notice Calculates the number of governance tokens
/// available for distribution in a farming campaign
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IFarm {
    /// @notice User that can grant access permissions and perform privileged actions
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    function setOwner(address _owner) external;

    /// @notice The amount of governance tokens available for the farming campaign
    function totalUnlocked() external view returns (uint256);

    /// @notice Look up if the farming campaign has been started
    function farmingStarted() external view returns (bool);

    /// @notice Look up if the farming campaign has been stopped
    function farmingStopped() external view returns (bool);

    /// @notice Look up when the farming has started
    function startTimestamp() external view returns (uint256);

    /// @notice Look up the last time when the farming was calculated
    function lastTimestamp() external view returns (uint256);

    /// @notice Starts the farming campaign
    function startFarming() external;

    /// @notice Stops the farming campaign
    function stopFarming() external;

    /// @notice Calculates the amount of governance tokens available for the farming campaign
    /// @dev Can only be called after the farming has started
    /// @dev Can only be called before the farming has stopped
    function unlockAsset() external;

    /// @notice Event emitted when the owner changes via `#setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    event SetOwner(address indexed ownerOld, address indexed ownerNew);
}
