//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IFarm.sol';

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
    mapping (address=>bool) public canAdd;
    mapping (address=>bool) public canSubtract;
    mapping (address=>bool) public canOpen;

    address[] public users;
    
    // chain code => in chain address => user id;
    mapping ( string => mapping (string => uint)) public internalAddress;
    mapping (uint => string) public chain;
    mapping (uint => string) public userAddress;
    
    uint public userMaxId;
    mapping (uint => uint) public userBalance;
    uint public totalBalance;

    event AddValue(address indexed adder, uint indexed userId, uint indexed amount);
    event SubtractValue(address indexed subtractor, uint indexed userId, uint indexed amount);
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

    function totalUsers() public view returns(uint) {
        return users.length;
    }
    
    function openAddress(string memory chainName, string memory addr) public returns (uint) {
        require(canOpen[msg.sender],"not allowed to add value");
        string storage curChain = chainName;
        if (!internalAddress[chain][addr]) {
            chain[userMaxId] = chain;
            userAddress[userMaxId] = addr;
            internalAddress[chain][addr] = userMaxId;
            userMaxId++;
        }
        return internalAddress[chain][addr];
    }
    
    function getFamiliarAddress (uint userId) public view returns (string memory, string memory) {
        return (chain[userId],userAddress[userId]);
    }

    function setCanOpen(address adder, bool _canAdd) public isOwner {
        canAdd[adder] = _canAdd;
        emit SetCanOpen(msg.sender, adder, canAdd[adder]);
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
    function addValue(uint userId, uint value) public {
        require(canAdd[msg.sender],"not allowed to add value");
        require(userId < userMaxId, "not a valid Id");
        userBalance[userId] += value;
        totalBalance += value;
        emit AddValue(msg.sender, userId, value);
    }

    // subtract user balance
    function subtractValue(uint userId, uint value) public {
        require(canSubtract[msg.sender],"not allowed to subtract");
        require(userId < userMaxId, "not a valid Id");
        userBalance[userId] -= value;
        totalBalance -= value;
        emit SubtractValue(msg.sender, userId, value);
    }
}
