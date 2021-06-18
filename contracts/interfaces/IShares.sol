//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IShares {
    function shareById(uint256 id) external returns (uint256);

    function totalShares() external returns (uint256);
}
