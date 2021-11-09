pragma solidity >=0.8.0;

import "../interfaces/IFarm.sol";

/// @title FarmLinear
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract FarmLinear is IFarm {
    uint256 public override totalUnlocked;
    
    function unlockAsset() public override {
        
    }
    
        /// @notice User that can grant access permissions and perform privileged actions
    function owner() external view override returns (address) {
        return address(0);
    }

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    function setOwner(address _owner) public override {}

    /// @notice Look up if the farming campaign has been started
    function farmingStarted() public override view returns (bool) {
        return true;
    }

    /// @notice Look up if the farming campaign has been stopped
    function farmingStopped() public override view returns (bool) {
        return false;
    }

    /// @notice Look up when the farming has started
    function startTimestamp() public view override returns (uint256) {        
        return block.timestamp;
    }

    /// @notice Look up the last time when the farming was calculated
    function lastTimestamp() public view override returns (uint256) {
        return block.timestamp;
    }

    /// @notice Starts the farming campaign
    function startFarming() public override {}

    /// @notice Stops the farming campaign
    function stopFarming() public override {}

    uint256 public amount;
    uint256 public period;

    constructor(uint _totalUnlocked) {
        totalUnlocked = _totalUnlocked;
    }

}
