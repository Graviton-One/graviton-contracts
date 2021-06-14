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
    mapping (address => uint) public finalValue;

    constructor(IFarm _farm, IBalanceKeeper _balanceKeeper, IBalanceKeeperLP _balanceKeeperLP) {
        farm = _farm;
        balanceKeeper = _balanceKeeper;
        balanceKeeperLP = _balanceKeeperLP;
    }

    function addUserBalance(address lptoken, address user) internal {
        uint amount = currentPortion[lptoken] * balanceKeeperLP.userBalance(lptoken, user) / balanceKeeperLP.supply(lptoken);
        balanceKeeper.addValue(user, amount);
    }

    function processBalancesForToken(address lptoken, uint step) public {

        uint toValue = finalValue[lptoken] + step;
        if (finalValue[lptoken] == 0) {
            currentPortion[lptoken] = farm.totalUnlocked() - lastPortion[lptoken];
        }
        uint fromValue = finalValue[lptoken];
        if (toValue > balanceKeeperLP.userCount(lptoken)) {
            toValue = balanceKeeperLP.userCount(lptoken);
        }
        for(uint i = fromValue; i < toValue; i++) {
            address user = balanceKeeperLP.users(lptoken, i);
            addUserBalance(lptoken, user);
        }
        if (toValue == balanceKeeperLP.userCount(lptoken)) {
            finalValue[lptoken] = 0;
            lastPortion[lptoken] += currentPortion[lptoken];
        } else {
            finalValue[lptoken] = toValue;
        }
    }

    function processBalances(uint step) public override {
        for(uint i = 0; i < balanceKeeperLP.lpTokenCount(); i++) {
            address lptoken = balanceKeeperLP.lpTokens(i);
            if (balanceKeeperLP.supply(lptoken) <= 0) { continue; } // skip if no supply for lptoken
            processBalancesForToken(lptoken, step);
            while (finalValue[lptoken] != 0) {
              processBalancesForToken(lptoken, step);
            }
        }
    }
}
