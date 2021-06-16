//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface ILPKeeper {
    function add(address lptoken, address user, uint amount) external;
    function subtract(address lptoken, address user, uint amount) external;
    function userBalance(address lptoken, address user) external returns (uint);
    function totalBalance(address lptoken) external returns (uint);
    function totalUsers(address lptoken) external returns (uint);
    function users(address lptoken, uint userId) external returns (address);
    function totalLPTokens() external returns (uint);
    function lpTokens(uint tokenId) external returns (address);
}
