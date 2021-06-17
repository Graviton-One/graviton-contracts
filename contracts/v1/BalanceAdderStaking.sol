//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import '../interfaces/IFarm.sol';
import '../interfaces/IBalanceKeeper.sol';
import '../interfaces/IBalanceAdder.sol';

/// @title BalanceAdderStaking
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderStaking is IBalanceAdder {

    // early birds emission data
    IFarm public farm;
    IBalanceKeeper public balanceKeeper;

    uint public counter;
    uint public totalUsers;
    uint public lastPortion;
    uint public currentPortion;
    uint public totalBalance;
    uint public totalUnlocked;

    constructor(IFarm _farm, IBalanceKeeper _balanceKeeper) {
        farm = _farm;
        balanceKeeper = _balanceKeeper;
    }

    function increaseUserStakeValue(address user) internal {
        require(totalBalance > 0, "there is no balance available for staking");
        uint prevBalance = balanceKeeper.userBalance(user);
        uint add = currentPortion * prevBalance / totalBalance;
        balanceKeeper.add(user, add);
    }

    function processBalances(uint step) public override {
        if (counter == 0) {
            totalUsers = balanceKeeper.totalUsers();
            totalUnlocked = farm.totalUnlocked();
            currentPortion = totalUnlocked - lastPortion;
            totalBalance = balanceKeeper.totalBalance();
        }
        uint min = counter;
        uint max = counter + step;

        if (max > totalUsers) {
            max = totalUsers;
        }

        for(uint i = min; i < max; i++) {
            address user = balanceKeeper.users(i);
            increaseUserStakeValue(user);
        }

        if (max == totalUsers) {
            counter = 0;
            lastPortion = totalUnlocked;
        } else {
            counter = max;
        }
    }
}
