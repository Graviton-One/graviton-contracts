//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IFarm {
    function totalUnlocked() external returns (uint);
}

/// @title BalanceKeeper
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceKeeper {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // oracles for changing user balances
    mapping (address=>bool) public allowedAdders;
    mapping (address=>bool) public allowedSubtractors;

    // user balances
    uint public totalUsers;
    mapping (address => bool) public knownUsers;
    mapping (uint => address) public userAddresses;

    mapping (address => uint) public userBalance;

    uint public totalBalance;

    event AddValueEvent(address indexed adder, address indexed user, uint indexed amount);
    event SubtractValueEvent(address indexed subtractor, address indexed user, uint indexed amount);
    event TransferOwnershipEvent(address oldOwner, address newOwner);
    event ToggleAdderEvent(address indexed owner, address indexed adder, bool indexed newBool);
    event ToggleSubtractorEvent(address indexed owner, address indexed subtractor, bool indexed newBool);

    constructor(address _owner) {
        owner = _owner;
    }

    function transferOwnership(address newOwner) public isOwner {
        address oldOwner = owner;
        owner = newOwner;
        emit TransferOwnershipEvent(oldOwner, newOwner);
    }

    // permit/forbid an oracle to add user balances
    function toggleAdder(address adder) public isOwner {
        allowedAdders[adder] = !allowedAdders[adder];
        emit ToggleAdderEvent(msg.sender, adder, allowedAdders[adder]);
    }

    // permit/forbid an oracle to subtract user balances
    function toggleSubtractor(address subtractor) public isOwner {
        allowedSubtractors[subtractor] = !allowedSubtractors[subtractor];
        emit ToggleSubtractorEvent(msg.sender, subtractor, allowedSubtractors[subtractor]);
    }

    // add user balance
    function addValue(address user, uint value) public {
        require(allowedAdders[msg.sender],"not allowed to add value");
        if ( !knownUsers[user]) {
            knownUsers[user] = true;
            userAddresses[totalUsers] = user;
            totalUsers++;
        }
        userBalance[user] += value;
        totalBalance += value;
        emit AddValueEvent(msg.sender, user, value);
    }

    // subtract user balance
    function subtractValue(address user, uint value) public {
        require(allowedSubtractors[msg.sender],"not allowed to subtract");
        userBalance[user] -= value;
        totalBalance -= value;
        emit SubtractValueEvent(msg.sender, user, value);
    }

}
