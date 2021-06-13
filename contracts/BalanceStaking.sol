//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IFarm.sol';
import './interfaces/IBalanceKeeper.sol';

/// @title BalanceStaking
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceStaking {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // early birds emission data
    IFarm public stakingFarmContract;
    IBalanceKeeper public balanceKeeper;

    uint public finalValue;
    uint public totalUsers;
    uint public prevPortion;
    uint public currentPortion;
    uint public totalBalance;
    uint public totalUnlocked;

    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, IFarm _farmStaking, IBalanceKeeper _balanceKeeper) {
        owner = _owner;
        stakingFarmContract = _farmStaking;
        balanceKeeper = _balanceKeeper;
    }

    function increaseUserStakeValue(address user) internal {
        uint prevBalance = balanceKeeper.userBalance(user);
        uint add = currentPortion * prevBalance / totalBalance;
        balanceKeeper.addValue(user, add);
    }

    function processBalances(uint step) public {
        if (finalValue == 0) {
            totalUsers = balanceKeeper.totalUsers();
            totalUnlocked = stakingFarmContract.totalUnlocked();
            currentPortion = totalUnlocked - prevPortion;
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
            prevPortion = totalUnlocked;
        } else {
            finalValue = toValue;
        }
    }
}
