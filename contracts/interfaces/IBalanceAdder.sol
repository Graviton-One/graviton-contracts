//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceAdder {
    function processBalances(uint step) external;
}

interface IBalanceAdderShares {
    function getShareById(uint id) external returns (uint);
    function getTotal() external returns (uint);
}