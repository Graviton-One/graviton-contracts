//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IFarm {
    function totalUnlocked() external returns (uint);
}

interface Impact {
    function impact(address user) external returns (uint);
    function totalSupply() external returns (uint);
    function users(uint id) external returns (address);
    function userCount() external returns (uint);
}

interface IBalanceKeeper {
    function addValue(address user, uint value) external;
    function userBalance(address user) external returns (uint);
    function userAddresses(uint id) external returns (address);
    function subtractValue(address user, uint value) external;
    function totalBalance() external returns (uint);
    function totalUsers() external returns (uint);
}

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
    Impact public ebImpactContract;

    IBalanceKeeper public balanceKeeper;

    uint public finalValue;
    uint public totalUsers;

    mapping (address => uint) public sendBalance;

    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, IFarm _ebFarmContract, Impact _ebImpactContract, IBalanceKeeper _balanceKeeper) {
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
