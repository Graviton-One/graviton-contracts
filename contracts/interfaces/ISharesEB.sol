//SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;

import "./IShares.sol";
import "./IBalanceKeeperV2.sol";
import "./IImpactKeeper.sol";

interface ISharesEB is IShares {
    function impactById(uint userId) external view returns (uint);
    function totalSupply() external view returns (uint);
    function lastUser() external view returns (uint);
    function balanceKeeper() external view returns (IBalanceKeeperV2);
    function impactEB() external view returns (IImpactKeeper);
    function migrate(uint step) external;
}
