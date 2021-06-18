//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IFarm.sol";
import "../interfaces/IBalanceKeeper.sol";
import "../interfaces/IBalanceAdder.sol";

/// @title BalanceAdderStaking
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderStaking is IBalanceAdder {

    // early birds emission data
    IFarm public farm;
    IBalanceKeeper public balanceKeeper;

    uint public lastUser;
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
        if (lastUser == 0) {
            totalUsers = balanceKeeper.totalUsers();
            totalUnlocked = farm.totalUnlocked();
            currentPortion = totalUnlocked - lastPortion;
            totalBalance = balanceKeeper.totalBalance();
        }
        uint fromUser = lastUser;
        uint toUser = lastUser + step;

        if (toUser > totalUsers) {
            toUser = totalUsers;
        }

        for(uint i = fromUser; i < toUser; i++) {
            address user = balanceKeeper.users(i);
            increaseUserStakeValue(user);
        }

        if (toUser == totalUsers) {
            lastUser = 0;
            lastPortion = totalUnlocked;
        } else {
            lastUser = toUser;
        }
    }
}
