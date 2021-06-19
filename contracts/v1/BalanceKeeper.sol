//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IBalanceKeeper.sol";

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
    mapping(address => bool) public canAdd;
    mapping(address => bool) public canSubtract;

    address[] public override users;
    mapping(address => bool) public isKnownUser;
    mapping(address => uint256) public override userBalance;
    uint256 public override totalBalance;

    event Add(
        address indexed adder,
        address indexed user,
        uint256 indexed amount
    );
    event Subtract(
        address indexed subtractor,
        address indexed user,
        uint256 indexed amount
    );
    event SetCanAdd(
        address indexed owner,
        address indexed adder,
        bool indexed newBool
    );
    event SetCanSubtract(
        address indexed owner,
        address indexed subtractor,
        bool indexed newBool
    );
    event SetOwner(address ownerOld, address ownerNew);

    constructor() {
        owner = msg.sender;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function totalUsers() public view override returns (uint256) {
        return users.length;
    }

    // permit/forbid an oracle to add user balances
    function setCanAdd(address adder, bool _canAdd) public isOwner {
        canAdd[adder] = _canAdd;
        emit SetCanAdd(msg.sender, adder, canAdd[adder]);
    }

    // permit/forbid an oracle to subtract user balances
    function setCanSubtract(address subtractor, bool _canSubtract)
        public
        isOwner
    {
        canSubtract[subtractor] = _canSubtract;
        emit SetCanSubtract(msg.sender, subtractor, canSubtract[subtractor]);
    }

    // add user balance
    function add(address user, uint256 amount) public override {
        require(canAdd[msg.sender], "not allowed to add");
        if (!isKnownUser[user]) {
            isKnownUser[user] = true;
            users.push(user);
        }
        userBalance[user] += amount;
        totalBalance += amount;
        emit Add(msg.sender, user, amount);
    }

    // subtract user balance
    function subtract(address user, uint256 amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        userBalance[user] -= amount;
        totalBalance -= amount;
        emit Subtract(msg.sender, user, amount);
    }
}
