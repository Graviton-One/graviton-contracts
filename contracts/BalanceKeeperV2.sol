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
    mapping (uint => string) public chainById;
    mapping (uint => bytes) public addressById;
    mapping (string => mapping (bytes => uint)) public _idByChainAddress;

    uint public override totalUsers;
    uint public override totalBalance;
    mapping (uint => uint) public override balanceById;

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

    function isKnownId(uint id) public view returns (bool) {
        return (id > 0 && id <= totalUsers);
    }

    function isKnownChainAddress(string memory chain, bytes memory addr) public view returns (bool) {
        return (_idByChainAddress[chain][addr] != 0);
    }

    function chainAddressById(uint id) public view returns (string memory, bytes memory) {
        return (chainById[id], addressById[id]);
    }

    function idByChainAddress(string memory chain, bytes memory addr) public view returns (uint) {
        return _idByChainAddress[chain][addr];
    }

    function openId(string memory chain, bytes memory addr) public returns (uint) {
        require(canOpen[msg.sender], "not allowed to open");
        if (_idByChainAddress[chain][addr] == 0) {
            uint id = totalUsers + 1;
            chainById[id] = chain;
            addressById[id] = addr;
            _idByChainAddress[chain][addr] = id;
            totalUsers++;
        }
        return _idByChainAddress[chain][addr];
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
        _subtract(id, amount);
    }

    function subtractByChainAddress(string memory chain, bytes memory addr, uint amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        _subtract(_idByChainAddress[chain][addr], amount);
    }

    function _add(uint id, uint amount) internal {
        balanceById[id] += amount;
        totalBalance += amount;
        emit Add(msg.sender, id, chainById[id], addressById[id], amount);
    }

    function _subtract(uint id, uint amount) internal {
        balanceById[id] -= amount;
        totalBalance -= amount;
        emit Subtract(msg.sender, id, chainById[id], addressById[id], amount);
    }
    
    // implement of share interface 
    function getShareById(uint id) public view override returns (uint) {
        return balanceById[id];
    }
    function getTotal() public view override returns (uint) {
        return totalBalance;
    }

}
