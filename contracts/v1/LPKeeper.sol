//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/ILPKeeper.sol";

/// @title LPKeeper
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract LPKeeper is ILPKeeper {
    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    address[] public override lpTokens;
    mapping(address => bool) public isKnownLPToken;
    mapping(address => uint256) public override totalBalance;

    mapping(address => address[]) public override users;
    mapping(address => mapping(address => bool)) public isKnownUser;

    mapping(address => mapping(address => uint256)) public override userBalance;

    // oracles for changing user lp balances
    mapping(address => bool) public canAdd;
    mapping(address => bool) public canSubtract;

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
    event Add(
        address indexed adder,
        address indexed lptoken,
        address indexed user,
        uint256 amount
    );
    event Subtract(
        address indexed subtractor,
        address indexed lptoken,
        address indexed user,
        uint256 amount
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

    function totalLPTokens() public view override returns (uint256) {
        return lpTokens.length;
    }

    function totalUsers(address lptoken)
        public
        view
        override
        returns (uint256)
    {
        return users[lptoken].length;
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

    function add(
        address lptoken,
        address user,
        uint256 amount
    ) public override {
        require(canAdd[msg.sender], "not allowed to add");
        if (!isKnownLPToken[lptoken]) {
            lpTokens.push(lptoken);
            isKnownLPToken[lptoken] = true;
        }
        if (!isKnownUser[lptoken][user]) {
            users[lptoken].push(user);
            isKnownUser[lptoken][user] = true;
        }
        userBalance[lptoken][user] += amount;
        totalBalance[lptoken] += amount;
        emit Add(msg.sender, lptoken, user, amount);
    }

    function subtract(
        address lptoken,
        address user,
        uint256 amount
    ) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        userBalance[lptoken][user] -= amount;
        totalBalance[lptoken] -= amount;
        emit Subtract(msg.sender, lptoken, user, amount);
    }
}
