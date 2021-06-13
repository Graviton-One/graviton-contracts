//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceLP {
    function addTokens(address lptoken, address user, uint value) external;
    function subtractTokens(address lptoken, address user, uint value) external;
}
