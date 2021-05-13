//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IFarm {
    function totalUnlocked() external returns (uint);
}

interface IBalanceKeeper {
    function addValue(address user, uint value) external;
    function userBalance(address user) external returns (uint);
    function userAddresses(uint id) external returns (address);
    function subtractValue(address user, uint value) external;
    function totalBalance() external returns (uint);
    function totalUsers() external returns (uint);
}

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

    mapping (address => uint) public sendBalance;

    constructor(address _owner, IFarm _FarmContract, IBalanceKeeper _balanceKeeper) {
        owner = _owner;
        stakingFarmContract = _FarmContract;
        balanceKeeper = _balanceKeeper;
    }

    function increaseUserStakeValue(address user) internal {
        uint prevBalance = balanceKeeper.userBalance(user);
        uint newBalance = stakingFarmContract.totalUnlocked() * prevBalance / balanceKeeper.totalBalance();
        uint add = newBalance - prevBalance;
        balanceKeeper.addValue(user,add);
    }

    function processBalances(uint step) public {
        uint toValue = finalValue + step;
        uint fromValue = finalValue;
        totalUsers = balanceKeeper.totalUsers();

        if (toValue > totalUsers){
            toValue = totalUsers;
        }

        for(uint i = fromValue; i < toValue; i++) {
            address user = balanceKeeper.userAddresses(i);
            increaseUserStakeValue(user);
        }

        if (toValue == totalUsers) {
            finalValue = 0;
        } else {
            finalValue = toValue;
        }
    }
}
