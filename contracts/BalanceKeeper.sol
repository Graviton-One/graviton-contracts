//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IBalanceKeeper.sol';

/// @title BalanceKeeper
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceKeeper is IBalanceKeeper {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // oracles for changing user balances
    mapping (address=>bool) public canAdd;
    mapping (address=>bool) public canSubtract;

    address[] public override users;
    mapping (address => bool) public userIsKnown;
    mapping (address => uint) public override userBalance;
    uint public override totalBalance;

    event AddValue(address indexed adder, address indexed user, uint indexed amount);
    event SubtractValue(address indexed subtractor, address indexed user, uint indexed amount);
    event SetCanAdd(address indexed owner, address indexed adder, bool indexed newBool);
    event SetCanSubtract(address indexed owner, address indexed subtractor, bool indexed newBool);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner) {
        owner = _owner;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function totalUsers() public view override returns (uint) {
        return users.length;
    }

    // permit/forbid an oracle to add user balances
    function setCanAdd(address adder, bool _canAdd) public isOwner {
        canAdd[adder] = _canAdd;
        emit SetCanAdd(msg.sender, adder, canAdd[adder]);
    }

    // permit/forbid an oracle to subtract user balances
    function setCanSubtract(address subtractor, bool _canSubtract) public isOwner {
        canSubtract[subtractor] = _canSubtract;
        emit SetCanSubtract(msg.sender, subtractor, canSubtract[subtractor]);
    }

    // add user balance
    function addValue(address user, uint value) public override {
        require(canAdd[msg.sender], "not allowed to add value");
        if ( !userIsKnown[user]) {
            userIsKnown[user] = true;
            users.push(user);
        }
        userBalance[user] += value;
        totalBalance += value;
        emit AddValue(msg.sender, user, value);
    }

    // subtract user balance
    function subtractValue(address user, uint value) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        userBalance[user] -= value;
        totalBalance -= value;
        emit SubtractValue(msg.sender, user, value);
    }
}
