//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IBalanceKeeperLP.sol';

/// @title BalanceKeeperLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceKeeperLP is IBalanceKeeperLP {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    address[] public override lpTokens;
    mapping (address => bool) public lpTokenIsKnown;
    mapping (address => uint) public override totalBalance;

    mapping (address => address[]) public override users;
    mapping (address => mapping (address => bool)) public userIsKnown;

    mapping (address => mapping (address => uint)) public override userBalance;

    // oracles for changing user lp balances
    mapping (address => bool) public canAdd;
    mapping (address => bool) public canSubtract;

    event SetCanAdd(address indexed owner,
                    address indexed adder,
                    bool indexed newBool);
    event SetCanSubtract(address indexed owner,
                         address indexed subtractor,
                         bool indexed newBool);
    event AddLPToken(address indexed adder,
                     address indexed lptoken,
                     address indexed user,
                     uint amount);
    event SubtractLPToken(address indexed subtractor,
                          address indexed lptoken,
                          address indexed user,
                          uint amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner) {
        owner = _owner;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function lpTokenCount() public view override returns (uint) {
        return lpTokens.length;
    }

    function userCount(address lptoken) public view override returns (uint) {
        return users[lptoken].length;
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

    function addLPToken(address lptoken,
                       address user,
                       uint amount) public override {
        require(canAdd[msg.sender], "not allowed to add value");
        if (!lpTokenIsKnown[lptoken]) {
            lpTokens.push(lptoken);
            lpTokenIsKnown[lptoken] = true;
        }
        if (!userIsKnown[lptoken][user]) {
            users[lptoken].push(user);
            userIsKnown[lptoken][user] = true;
        }
        userBalance[lptoken][user] += amount;
        totalBalance[lptoken] += amount;
        emit AddLPToken(msg.sender, lptoken, user, amount);
    }

    function subtractLPToken(address lptoken,
                            address user,
                            uint amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        userBalance[lptoken][user] -= amount;
        totalBalance[lptoken] -= amount;
        emit SubtractLPToken(msg.sender, lptoken, user, amount);
    }

}
