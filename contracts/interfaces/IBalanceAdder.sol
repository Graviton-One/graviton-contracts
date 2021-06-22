//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceAdder {
    function processBalances(uint256 step) external;
}
