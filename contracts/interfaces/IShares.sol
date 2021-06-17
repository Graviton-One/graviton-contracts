//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IShares {
    function shareById(uint id) external returns (uint);
    function totalShares() external returns (uint);
}
