//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IShares.sol";
import "./IFarm.sol";
import "./IBalanceKeeperV2.sol";

interface IBalanceAdderV2 {
    function owner() external view returns (address);
    function shares(uint farmId) external view returns (IShares);
    function farms(uint farmId) external view returns (IFarm);
    function lastPortions(uint farmId) external view returns (uint);
    function lastUser() external view returns (uint);
    function currentFarm() external view returns (uint);
    function currentPortion() external view returns (uint);
    function totalUnlocked() external view returns (uint);
    function totalBalance() external view returns (uint);
    function balanceKeeper() external view returns (IBalanceKeeperV2);
    function isProcessing(uint farmId) external view returns (bool);
    function totalFarms() external view returns (uint);
    function totalUsers() external view returns (uint);
    function setOwner(address _owner) external;
    function addFarm(IShares _share, IFarm _farm) external;
    function removeFarm(uint farmId) external;
    function processBalances(uint step) external;
}
