//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceKeeperV2 {
    function addById(uint id, uint amount) external;
    function addByChainAddress(string memory chain, bytes memory addr, uint amount) external;
    function subtractById(uint id, uint amount) external;
    function subtractByChainAddress(string memory chain, bytes memory addr, uint amount) external;
    function balanceById(uint id) external returns (uint);
    function totalBalance() external returns (uint);
    function totalUsers() external returns (uint);
}
