//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IFarm.sol';
import './interfaces/IBalanceKeeper.sol';
import './interfaces/IBalanceKeeperLP.sol';
import './interfaces/IBalanceAdder.sol';

/// @title BalanceAdderLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderLP is IBalanceAdder {

    IFarm public farm;
    IBalanceKeeper public balanceKeeper;
    IBalanceKeeperLP public balanceKeeperLP;

    mapping (address => uint) public currentPortion;
    mapping (address => uint) public lastPortion;
    mapping (address => uint) public counter;

    constructor(IFarm _farm, IBalanceKeeper _balanceKeeper, IBalanceKeeperLP _balanceKeeperLP) {
        farm = _farm;
        balanceKeeper = _balanceKeeper;
        balanceKeeperLP = _balanceKeeperLP;
    }

    function addUserBalance(address lptoken, address user) internal {
        uint amount = currentPortion[lptoken] * balanceKeeperLP.userBalance(lptoken, user) / balanceKeeperLP.totalBalance(lptoken);
        balanceKeeper.add(user, amount);
    }

    function processBalancesForToken(address lptoken, uint step) public {

        uint max = counter[lptoken] + step;
        if (counter[lptoken] == 0) {
            currentPortion[lptoken] = farm.totalUnlocked() - lastPortion[lptoken];
        }
        uint min = counter[lptoken];
        if (max > balanceKeeperLP.totalUsers(lptoken)) {
            max = balanceKeeperLP.totalUsers(lptoken);
        }
        for(uint i = min; i < max; i++) {
            address user = balanceKeeperLP.users(lptoken, i);
            addUserBalance(lptoken, user);
        }
        if (max == balanceKeeperLP.totalUsers(lptoken)) {
            counter[lptoken] = 0;
            lastPortion[lptoken] += currentPortion[lptoken];
        } else {
            counter[lptoken] = max;
        }
    }

    function processBalances(uint step) public override {
        for(uint i = 0; i < balanceKeeperLP.totalLPTokens(); i++) {
            address lptoken = balanceKeeperLP.lpTokens(i);
            if (balanceKeeperLP.totalBalance(lptoken) <= 0) { continue; } // skip if no totalBalance for lptoken
            processBalancesForToken(lptoken, step);
            while (counter[lptoken] != 0) {
              processBalancesForToken(lptoken, step);
            }
        }
    }
}
