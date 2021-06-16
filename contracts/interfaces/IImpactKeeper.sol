//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IImpactKeeper {
    function impact(address user) external returns (uint);
    function totalSupply() external returns (uint);
    function users(uint id) external returns (address);
    function totalUsers() external returns (uint);
}
