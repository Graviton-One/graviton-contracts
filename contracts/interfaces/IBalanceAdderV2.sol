//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IShares.sol";
import "./IFarm.sol";
import "./IBalanceKeeperV2.sol";

interface IBalanceAdderV2 {
    function owner() external view returns (address);

    function shares(uint256 farmId) external view returns (IShares);

    function farms(uint256 farmId) external view returns (IFarm);

    function lastPortions(uint256 farmId) external view returns (uint256);

    function lastUser() external view returns (uint256);

    function currentFarm() external view returns (uint256);

    function currentPortion() external view returns (uint256);

    function totalUnlocked() external view returns (uint256);

    function totalBalance() external view returns (uint256);

    function balanceKeeper() external view returns (IBalanceKeeperV2);

    function isProcessing(uint256 farmId) external view returns (bool);

    function totalFarms() external view returns (uint256);

    function totalUsers() external view returns (uint256);

    function setOwner(address _owner) external;

    function addFarm(IShares _share, IFarm _farm) external;

    function removeFarm(uint256 farmId) external;

    function processBalances(uint256 step) external;
}
