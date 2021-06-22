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

    uint256 public lastUser;
    uint256 public totalUsers;

    mapping(address => uint256) public lastPortion;

    constructor(
        IFarm _farm,
        IImpactKeeper _impactEB,
        IBalanceKeeper _balanceKeeper
    ) {
        farm = _farm;
        impactEB = _impactEB;
        balanceKeeper = _balanceKeeper;
        totalUsers = impactEB.userCount();
    }

    function addEB(address user) internal {
        uint256 currentPortion = (farm.totalUnlocked() *
            impactEB.impact(user)) / impactEB.totalSupply();
        uint256 add = currentPortion - lastPortion[user];
        lastPortion[user] = currentPortion;
        balanceKeeper.add(user, add);
    }

    function processBalances(uint256 step) public override {
        uint256 toUser = lastUser + step;
        uint256 fromUser = lastUser;

        if (toUser > totalUsers) {
            toUser = totalUsers;
        }

        for (uint256 i = fromUser; i < toUser; i++) {
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
