//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IFarm.sol';
import './interfaces/IBalanceKeeper.sol';
import './interfaces/ILPKeeper.sol';
import './interfaces/IBalanceAdder.sol';

/// @title BalanceAdderLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderLP is IBalanceAdder {

    IFarm public farm;
    IBalanceKeeper public balanceKeeper;
    ILPKeeper public lpKeeper;

    mapping (address => uint) public currentPortion;
    mapping (address => uint) public lastPortion;
    mapping (address => uint) public counter;

    constructor(IFarm _farm, IBalanceKeeper _balanceKeeper, ILPKeeper _lpKeeper) {
        farm = _farm;
        balanceKeeper = _balanceKeeper;
        lpKeeper = _lpKeeper;
    }

    function addUserBalance(address lptoken, address user) internal {
        uint amount = currentPortion[lptoken] * lpKeeper.userBalance(lptoken, user) / lpKeeper.totalBalance(lptoken);
        balanceKeeper.add(user, amount);
    }

    function processBalancesForToken(address lptoken, uint step) public {

        uint max = counter[lptoken] + step;
        if (counter[lptoken] == 0) {
            currentPortion[lptoken] = farm.totalUnlocked() - lastPortion[lptoken];
        }
        uint min = counter[lptoken];
        if (max > lpKeeper.totalUsers(lptoken)) {
            max = lpKeeper.totalUsers(lptoken);
        }
        for(uint i = min; i < max; i++) {
            address user = lpKeeper.users(lptoken, i);
            addUserBalance(lptoken, user);
        }
        if (max == lpKeeper.totalUsers(lptoken)) {
            counter[lptoken] = 0;
            lastPortion[lptoken] += currentPortion[lptoken];
        } else {
            counter[lptoken] = max;
        }
    }

    function processBalances(uint step) public override {
        for(uint i = 0; i < lpKeeper.totalLPTokens(); i++) {
            address lptoken = lpKeeper.lpTokens(i);
            if (lpKeeper.totalBalance(lptoken) <= 0) { continue; } // skip if no totalBalance for lptoken
            processBalancesForToken(lptoken, step);
            while (counter[lptoken] != 0) {
              processBalancesForToken(lptoken, step);
            }
        }
    }
}
