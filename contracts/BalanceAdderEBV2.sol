//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IFarm.sol';
import './interfaces/IImpactKeeper.sol';
import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/IBalanceAdder.sol';

/// @title BalanceAdderEBV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderEBV2 is IBalanceAdder {

    // early birds emission data
    IFarm public farm;
    IImpactKeeper public impactEB;

    IBalanceKeeperV2 public balanceKeeper;

    uint public counter;
    uint public totalUsers;

    mapping (address => uint) public lastPortion;

    constructor(IFarm _farm, IImpactKeeper _impactEB, IBalanceKeeperV2 _balanceKeeper) {
        farm = _farm;
        impactEB = _impactEB;
        balanceKeeper = _balanceKeeper;
        totalUsers = impactEB.totalUsers();
    }

    function addEB(address user) internal {
        uint currentPortion = farm.totalUnlocked() * impactEB.impact(user) / impactEB.totalSupply();
        uint add = currentPortion - lastPortion[user];
        lastPortion[user] = currentPortion;
        balanceKeeper.addByChainAddress("EVM", abi.encodePacked(user), add);
    }

    function processBalances(uint step) public override {
        uint max = counter + step;
        uint min = counter;

        if (max > totalUsers) {
            max = totalUsers;
        }

        for(uint i = min; i < max; i++) {
            address user = impactEB.users(i);
            addEB(user);
        }

        if (max == totalUsers) {
            counter = 0;
        } else {
            counter = max;
        }
    }
}
