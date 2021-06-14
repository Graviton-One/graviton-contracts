//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IFarm.sol';
import './interfaces/IBalanceKeeper.sol';

/// @title BalanceStaking
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceStaking {

    // early birds emission data
    IFarm public farm;
    IBalanceKeeper public balanceKeeper;

    uint public finalValue;
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
        balanceKeeper.addValue(user, add);
    }

    function processBalances(uint step) public {
        if (finalValue == 0) {
            totalUsers = balanceKeeper.totalUsers();
            totalUnlocked = farm.totalUnlocked();
            currentPortion = totalUnlocked - lastPortion;
            totalBalance = balanceKeeper.totalBalance();
        }
        uint toValue = finalValue + step;
        uint fromValue = finalValue;

        if (toValue > totalUsers) {
            toValue = totalUsers;
        }

        for(uint i = fromValue; i < toValue; i++) {
            address user = balanceKeeper.users(i);
            increaseUserStakeValue(user);
        }

        if (toValue == totalUsers) {
            finalValue = 0;
            lastPortion = totalUnlocked;
        } else {
            finalValue = toValue;
        }
    }
}
