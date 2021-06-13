//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceKeeper {
    function addValue(address user, uint value) external;
    function userBalance(address user) external returns (uint);
    function users(uint id) external returns (address);
    function subtractValue(address user, uint value) external;
    function totalBalance() external returns (uint);
    function totalUsers() external returns (uint);
}
