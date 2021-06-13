//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IFarm.sol';
import './interfaces/IImpactKeeper.sol';
import './interfaces/IBalanceKeeper.sol';

/// @title BalanceEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceEB {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // early birds emission data
    IFarm public ebFarmContract;
    IImpactKeeper public ebImpactContract;

    IBalanceKeeper public balanceKeeper;

    uint public finalValue;
    uint public totalUsers;

    mapping (address => uint) public sendBalance;

    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, IFarm _ebFarmContract, IImpactKeeper _ebImpactContract, IBalanceKeeper _balanceKeeper) {
        owner = _owner;
        ebFarmContract = _ebFarmContract;
        ebImpactContract = _ebImpactContract;
        balanceKeeper = _balanceKeeper;
        totalUsers = ebImpactContract.userCount();
    }

    function increaseUserEbValue(address user) internal {
        uint newBalance = ebFarmContract.totalUnlocked() * ebImpactContract.impact(user) / ebImpactContract.totalSupply();
        uint add = newBalance - sendBalance[user];
        sendBalance[user] = newBalance;
        balanceKeeper.addValue(user,add);
    }

    function processBalances(uint step) public {
        uint toValue = finalValue + step;
        uint fromValue = finalValue;
        if (toValue > totalUsers){
            toValue = totalUsers;
        }
        for(uint i = fromValue; i < toValue; i++) {
            address user = ebImpactContract.users(i);
            increaseUserEbValue(user);
        }
        if (toValue == totalUsers) {
            finalValue = 0;
        } else {
            finalValue = toValue;
        }
    }
}
