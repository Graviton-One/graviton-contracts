//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IVoter {
    function checkVoteBalances(address user, uint newBalance) external;
}
