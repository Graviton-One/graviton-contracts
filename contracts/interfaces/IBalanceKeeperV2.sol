//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceKeeperV2 {
    function addById(uint id, uint amount) external;
    function addByChainAddress(string memory chain, bytes memory addr, uint amount) external;
    function subtractById(uint id, uint amount) external;
    function subtractByChainAddress(string memory chain, bytes memory addr, uint amount) external;
    function isKnownChainAddress(string memory chain, bytes memory addr) external returns (bool);
    function isKnownId(uint id) external returns (bool);
    function openId(string memory chain, bytes memory addr) external;
    function balanceById(uint id) external returns (uint);
    function balanceByChainAddress(string memory chain, bytes memory addr) external returns (uint);
    function totalBalance() external returns (uint);
    function totalUsers() external returns (uint);
}
