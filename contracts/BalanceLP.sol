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

/// @title BalanceLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceLP {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IFarm farm;
    IBalanceKeeper balanceKeeper;

    uint public userCount;
    mapping (uint => address) public users;
    mapping (address => bool) public knownUsers;
    mapping (address => bool) public knownLpTokens;
    mapping (uint => address) public lpTokens;
    mapping (address => mapping (address => uint)) public userBalance;
    uint public totalSupply;
    mapping (address => uint) public lpSupply;
    uint public currentPortion;
    uint public totalProcessed;
    uint public finalValue;
    uint public totalLocked;

    // oracles for changing user lp balances
    mapping (address=>bool) public allowedAdders;
    mapping (address=>bool) public allowedSubtractors;

    event ToggleAdderEvent(address indexed owner,
                           address indexed adder,
                           bool indexed newBool);
    event ToggleSubtractorEvent(address indexed owner,
                                address indexed subtractor,
                                bool indexed newBool);
    event AddTokensEvent(address indexed adder,
                         address indexed lptoken,
                         address indexed user,
                         uint amount);
    event SubtractTokensEvent(address indexed subtractor,
                              address indexed lptoken,
                              address indexed user,
                              uint amount);

    constructor(address _owner, IFarm _farm, IBalanceKeeper _balanceKeeper) {
        owner = _owner;
        farm = _farm;
        balanceKeeper = _balanceKeeper;
    }

    function transferOwnership(address newOwner) public isOwner {
        owner = newOwner;
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

    function addTokens(address lptoken,
                       address user,
                       uint amount) public {
        require(allowedAdders[msg.sender],"not allowed to add value");
        if (!knownUsers[user]) {
            users[userCount] = user;
            userCount++;
            knownUsers[user] = true;
        }
        userBalance[lptoken][user] = userBalance[lptoken][user] + amount;
        lpSupply[lptoken] = lpSupply[lptoken] + amount;
        totalSupply = totalSupply + amount;
        emit AddTokensEvent(msg.sender, lptoken, user, amount);
    }

    function subtractTokens(address lptoken,
                            address user,
                            uint amount) public {
        require(allowedSubtractors[msg.sender],"not allowed to subtract");
        userBalance[lptoken][user] = userBalance[lptoken][user] - amount;
        lpSupply[lptoken] = lpSupply[lptoken] - amount;
        totalSupply = totalSupply - amount;
        emit SubtractTokensEvent(msg.sender, lptoken, user, amount);
    }

    function addUserBalance(address lptoken, address user) internal {
        uint amount = currentPortion * userBalance[lptoken][user] / lpSupply[lptoken];
        balanceKeeper.addValue(user, amount);
    }

    function processBalances(address token, uint step) public {
        uint toValue = finalValue + step;
        if (finalValue == 0) {
            currentPortion = farm.totalUnlocked() - totalProcessed;
        }
        uint fromValue = finalValue;
        if (toValue > userCount){
            toValue = userCount;
        }
        for(uint i = fromValue; i <= toValue; i++) {
            address user = users[i];
            addUserBalance(token, user);
        }
        if (toValue == userCount) {
            finalValue = 0;
            totalProcessed += currentPortion;
        } else {
            finalValue = toValue;
        }
    }
}
