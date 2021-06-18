//SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;

import "./IShares.sol";
import "./IBalanceKeeperV2.sol";
import "./ILPKeeperV2.sol";

interface ISharesLP is IShares {
    function balanceKeeper() external view returns (IBalanceKeeperV2);
    function lpKeeper() external view returns (ILPKeeperV2);
    function tokenId() external view returns (uint);
}
