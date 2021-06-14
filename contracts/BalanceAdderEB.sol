//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IFarm.sol';
import './interfaces/IImpactKeeper.sol';
import './interfaces/IBalanceKeeper.sol';
import './interfaces/IBalanceAdder.sol';

/// @title BalanceAdderEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderEB is IBalanceAdder {

    // early birds emission data
    IFarm public farm;
    IImpactKeeper public impactEB;

    IBalanceKeeper public balanceKeeper;

    uint public finalValue;
    uint public totalUsers;

    mapping (address => uint) public lastPortion;

    constructor(IFarm _farm, IImpactKeeper _impactEB, IBalanceKeeper _balanceKeeper) {
        farm = _farm;
        impactEB = _impactEB;
        balanceKeeper = _balanceKeeper;
        totalUsers = impactEB.userCount();
    }

    function addValueEB(address user) internal {
        uint currentPortion = farm.totalUnlocked() * impactEB.impact(user) / impactEB.totalSupply();
        uint add = currentPortion - lastPortion[user];
        lastPortion[user] = currentPortion;
        balanceKeeper.addValue(user, add);
    }

    function processBalances(uint step) public override {
        uint toValue = finalValue + step;
        uint fromValue = finalValue;
        if (toValue > totalUsers) {
            toValue = totalUsers;
        }
        for(uint i = fromValue; i < toValue; i++) {
            address user = impactEB.users(i);
            addValueEB(user);
        }
        if (toValue == totalUsers) {
            finalValue = 0;
        } else {
            finalValue = toValue;
        }
    }
}
