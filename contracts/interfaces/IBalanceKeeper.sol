//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceKeeper {
    function add(address user, uint256 value) external;

    function subtract(address user, uint256 value) external;

    function userBalance(address user) external returns (uint256);

    function users(uint256 id) external returns (address);

    function totalBalance() external returns (uint256);

    function totalUsers() external returns (uint256);
}
