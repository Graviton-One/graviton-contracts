//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceAdderShares {
    function getShareById(uint id) external returns (uint);
    function getTotal() external returns (uint);
}
