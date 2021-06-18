//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IFarm {
    function owner() external view returns (address);
    function totalUnlocked() external view returns (uint);
    function lastClaimedTimestamp() external view returns (uint);
    function startTimestampOffset() external view returns (uint);
    function deprecated() external view returns (bool);
    function farmingStarted() external view returns (bool);
    function setOwner(address _owner) external;
    function setDeprecated() external;
    function startFarming() external;
    function unlockAsset() external;
}
