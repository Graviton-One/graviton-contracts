//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IImpactKeeper {
    function impact(address user) external returns (uint256);

    function totalSupply() external returns (uint256);

    function users(uint256 id) external returns (address);

    function userCount() external returns (uint256);
}
