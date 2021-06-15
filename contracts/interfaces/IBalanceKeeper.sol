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

interface IBalanceKeeperV2 {
    function addValue(uint user, uint value) external;
    function userBalance(uint user) external returns (uint);
    function openAddress(string memory chain, string memory addr) external returns (uint);
    function userIdByChainAndAddress(string memory chain, string memory addr) external view returns (uint);
    function chainAndAddressByUserId(uint userId) external view returns (string memory, string memory);
    function subtractValue(uint user, uint value) external;
    function totalBalance() external returns (uint);
    function totalUsers() external returns (uint);
}

