//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceKeeperLP {
    function addLPToken(address lptoken, address user, uint value) external;
    function subtractLPToken(address lptoken, address user, uint value) external;
    function userBalance(address lptoken, address user) external returns (uint);
    function supply(address lptoken) external returns (uint);
    function userCount(address lptoken) external returns (uint);
    function users(address lptoken, uint userId) external returns (address);
    function lpTokenCount() external returns (uint);
    function lpTokens(uint tokenId) external returns (address);
}
