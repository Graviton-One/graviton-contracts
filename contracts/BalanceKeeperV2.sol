//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/IShares.sol';

/// @title BalanceKeeperV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceKeeperV2 is IBalanceKeeperV2, IShares {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // oracles for changing user balances
    mapping (address => bool) public canAdd;
    mapping (address => bool) public canSubtract;
    mapping (address => bool) public canOpen;

    // chain code => in chain address => user id;
    mapping (uint => string) internal _userChainById;
    mapping (uint => bytes) internal _userAddressById;
    mapping (string => mapping (bytes => uint)) internal _userIdByChainAddress;
    mapping (string => mapping (bytes => bool)) internal _isKnownUser;

    uint public override totalUsers;
    uint public override totalBalance;
    mapping (uint => uint) internal _balance;

    event SetOwner
        (address ownerOld,
         address ownerNew);
    event SetCanOpen
        (address indexed owner,
         address indexed opener,
         bool indexed newBool);
    event SetCanAdd
        (address indexed owner,
         address indexed adder,
         bool indexed newBool);
    event SetCanSubtract
        (address indexed owner,
         address indexed subtractor,
         bool indexed newBool);
    event Add
        (address indexed adder,
         uint indexed userId,
         uint amount);
    event Subtract
        (address indexed subtractor,
         uint indexed userId,
         uint amount);

    constructor(address _owner) {
        owner = _owner;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setCanOpen(address opener, bool _canOpen) public isOwner {
        canOpen[opener] = _canOpen;
        emit SetCanOpen(msg.sender, opener, canOpen[opener]);
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

    function isKnownUser(uint userId) public view override returns (bool) {
        return userId < totalUsers;
    }

    function isKnownUser(string calldata userChain, bytes calldata userAddress) public view override returns (bool) {
        return _isKnownUser[userChain][userAddress];
    }

    function userChainById(uint userId) public view override returns (string memory) {
        require(isKnownUser(userId), "user is not known");
        return _userChainById[userId];
    }

    function userAddressById(uint userId) public view override returns (bytes memory) {
        require(isKnownUser(userId), "user is not known");
        return _userAddressById[userId];
    }

    function userChainAddressById(uint userId) public view override returns (string memory, bytes memory) {
        require(isKnownUser(userId), "user is not known");
        return (_userChainById[userId], _userAddressById[userId]);
    }

    function userIdByChainAddress(string calldata userChain, bytes calldata userAddress) public view override returns (uint) {
        require(isKnownUser(userChain, userAddress), "user is not known");
        return _userIdByChainAddress[userChain][userAddress];
    }

    function balance(uint userId) public view override returns (uint) {
        return _balance[userId];
    }

    function balance(string calldata userChain, bytes calldata userAddress) public view override returns (uint) {
        return _balance[_userIdByChainAddress[userChain][userAddress]];
    }

    function open(string calldata userChain, bytes calldata userAddress) public override {
        require(canOpen[msg.sender], "not allowed to open");
        if (!isKnownUser(userChain, userAddress)) {
            uint userId = totalUsers;
            _userChainById[userId] = userChain;
            _userAddressById[userId] = userAddress;
            _userIdByChainAddress[userChain][userAddress] = userId;
            _isKnownUser[userChain][userAddress] = true;
            totalUsers++;
        }
    }

    // add user balance
    function add(uint userId, uint amount) public override {
        require(canAdd[msg.sender], "not allowed to add");
        require(isKnownUser(userId), "user is not known");
        _add(userId, amount);
    }

    function add(string calldata userChain, bytes calldata userAddress, uint amount) public override {
        require(canAdd[msg.sender], "not allowed to add");
        require(isKnownUser(userChain, userAddress), "user is not known");
        _add(_userIdByChainAddress[userChain][userAddress], amount);
    }

    function _add(uint userId, uint amount) internal {
        _balance[userId] += amount;
        totalBalance += amount;
        emit Add(msg.sender, userId, amount);
    }

    // subtract user balance
    function subtract(uint userId, uint amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        require(isKnownUser(userId), "user is not known");
        _subtract(userId, amount);
    }

    function subtract(string calldata userChain, bytes calldata userAddress, uint amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        require(isKnownUser(userChain, userAddress), "user is not known");
        _subtract(_userIdByChainAddress[userChain][userAddress], amount);
    }

    function _subtract(uint userId, uint amount) internal {
        _balance[userId] -= amount;
        totalBalance -= amount;
        emit Subtract(msg.sender, userId, amount);
    }
    
    function getShareById(uint userId) public view override returns (uint) {
        return _balance[userId];
    }

    function getTotal() public view override returns (uint) {
        return totalBalance;
    }
}
