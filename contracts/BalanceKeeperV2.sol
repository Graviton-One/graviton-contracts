//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/IBalanceAdder.sol';

/// @title BalanceKeeperV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceKeeperV2 is IBalanceKeeperV2, IBalanceAdderShares {

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
    mapping (uint => string) internal _chainById;
    mapping (uint => bytes) internal _addressById;
    mapping (string => mapping (bytes => uint)) internal _idByChainAddress;
    mapping (string => mapping (bytes => bool)) internal _isKnownChainAddress;

    uint public override totalUsers;
    uint public override totalBalance;
    mapping (uint => uint) internal _balanceById;

    event Add(address indexed adder,
              uint indexed id,
              string chain,
              bytes indexed addr,
              uint amount);
    event Subtract(address indexed subtractor,
                   uint indexed id,
                   string chain,
                   bytes indexed addr,
                   uint amount);
    event SetCanAdd(address indexed owner, address indexed adder, bool indexed newBool);
    event SetCanOpen(address indexed owner, address indexed opener, bool indexed newBool);
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

    function isKnownId(uint id) public view override returns (bool) {
        return _isKnownChainAddress[_chainById[id]][_addressById[id]];
    }

    function isKnownChainAddress(string memory chain, bytes memory addr) public view override returns (bool) {
        return _isKnownChainAddress[chain][addr];
    }

    function chainById(uint id) public view returns (string memory) {
        require(isKnownId(id), "user is not known");
        return _chainById[id];
    }

    function addressById(uint id) public view returns (bytes memory) {
        require(isKnownId(id), "user is not known");
        return _addressById[id];
    }

    function chainAddressById(uint id) public view returns (string memory, bytes memory) {
        require(isKnownId(id), "user is not known");
        return (_chainById[id], _addressById[id]);
    }

    function idByChainAddress(string memory chain, bytes memory addr) public view returns (uint) {
        require(isKnownChainAddress(chain, addr), "user is not known");
        return _idByChainAddress[chain][addr];
    }

    function balanceById(uint id) public view override returns (uint) {
        return _balanceById[id];
    }

    function balanceByChainAddress(string memory chain, bytes memory addr) public view override returns (uint) {
        return _balanceById[_idByChainAddress[chain][addr]];
    }

    function openId(string memory chain, bytes memory addr) public override {
        require(canOpen[msg.sender], "not allowed to open");
        if (!_isKnownChainAddress[chain][addr]) {
            uint id = totalUsers;
            _chainById[id] = chain;
            _addressById[id] = addr;
            _idByChainAddress[chain][addr] = id;
            _isKnownChainAddress[chain][addr] = true;
            totalUsers++;
        }
    }

    // add user balance
    function addById(uint id, uint amount) public override {
        require(canAdd[msg.sender], "not allowed to add");
        require(isKnownId(id), "user is not known");
        _add(id, amount);
    }

    function addByChainAddress(string memory chain, bytes memory addr, uint amount) public override {
        require(canAdd[msg.sender], "not allowed to add");
        require(isKnownChainAddress(chain, addr), "user is not known");
        _add(_idByChainAddress[chain][addr], amount);
    }

    // subtract user balance
    function subtractById(uint id, uint amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        require(isKnownId(id), "user is not known");
        _subtract(id, amount);
    }

    function subtractByChainAddress(string memory chain, bytes memory addr, uint amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        require(isKnownChainAddress(chain, addr), "user is not known");
        _subtract(_idByChainAddress[chain][addr], amount);
    }

    function _add(uint id, uint amount) internal {
        _balanceById[id] += amount;
        totalBalance += amount;
        emit Add(msg.sender, id, _chainById[id], _addressById[id], amount);
    }

    function _subtract(uint id, uint amount) internal {
        _balanceById[id] -= amount;
        totalBalance -= amount;
        emit Subtract(msg.sender, id, _chainById[id], _addressById[id], amount);
    }
    
    function getShareById(uint id) public view override returns (uint) {
        return _balanceById[id];
    }

    function getTotal() public view override returns (uint) {
        return totalBalance;
    }
}
