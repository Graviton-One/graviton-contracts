//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IFarm.sol";
import "../interfaces/IImpactKeeper.sol";
import "../interfaces/IBalanceKeeper.sol";
import "../interfaces/IBalanceAdder.sol";

/// @title BalanceAdderEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderEB is IBalanceAdder {

    // early birds emission data
    IFarm public farm;
    IImpactKeeper public impactEB;

    IBalanceKeeper public balanceKeeper;

    uint public lastUser;
    uint public totalUsers;

    mapping (address => uint) public lastPortion;

    constructor(IFarm _farm, IImpactKeeper _impactEB, IBalanceKeeper _balanceKeeper) {
        farm = _farm;
        impactEB = _impactEB;
        balanceKeeper = _balanceKeeper;
        totalUsers = impactEB.totalUsers();
    }

    function addEB(address user) internal {
        uint currentPortion = farm.totalUnlocked() * impactEB.impact(user) / impactEB.totalSupply();
        uint add = currentPortion - lastPortion[user];
        lastPortion[user] = currentPortion;
        balanceKeeper.add(user, add);
    }

    function processBalances(uint step) public override {
        uint toUser = lastUser + step;
        uint fromUser = lastUser;

        if (toUser > totalUsers) {
            toUser = totalUsers;
        }

        for (uint i = fromUser; i < toUser; i++) {
            address user = impactEB.users(i);
            addEB(user);
        }

        if (toUser == totalUsers) {
            lastUser = 0;
        } else {
            lastUser = toUser;
        }
    }
}
