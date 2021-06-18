//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IShares.sol";
import "./IBalanceKeeperV2.sol";
import "./IImpactKeeper.sol";

interface ISharesEB is IShares {
    function impactById(uint256 userId) external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function lastUser() external view returns (uint256);

    function balanceKeeper() external view returns (IBalanceKeeperV2);

    function impactEB() external view returns (IImpactKeeper);

    function migrate(uint256 step) external;
}
