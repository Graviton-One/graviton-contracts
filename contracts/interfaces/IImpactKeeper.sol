//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IImpactKeeper {
    function impact(address user) external view returns (uint);
    function totalSupply() external view returns (uint);
    function users(uint id) external view returns (address);
    function totalUsers() external view returns (uint);
}
