//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceKeeper {
    function add(address user, uint value) external;
    function subtract(address user, uint value) external;
    function userBalance(address user) external returns (uint);
    function users(uint id) external returns (address);
    function totalBalance() external returns (uint);
    function totalUsers() external returns (uint);
}
