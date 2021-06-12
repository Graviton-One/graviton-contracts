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

    IFarm public farm;
    IBalanceKeeper public balanceKeeper;

    address[] public lpTokens;
    mapping (address => bool) public lpTokenIsKnown;
    mapping (address => uint) public supply;

    mapping (address => address[]) public users;
    mapping (address => mapping (address => bool)) public userIsKnown;

    mapping (address => mapping (address => uint)) public userBalance;

    mapping (address => uint) public currentPortion;
    mapping (address => uint) public previousPortion;
    mapping (address => uint) public finalValue;

    // oracles for changing user lp balances
    mapping (address=>bool) public allowedAdders;
    mapping (address=>bool) public allowedSubtractors;

    event ToggleAdder(address indexed owner,
                           address indexed adder,
                           bool indexed newBool);
    event ToggleSubtractor(address indexed owner,
                                address indexed subtractor,
                                bool indexed newBool);
    event AddTokens(address indexed adder,
                         address indexed lptoken,
                         address indexed user,
                         uint amount);
    event SubtractTokens(address indexed subtractor,
                              address indexed lptoken,
                              address indexed user,
                              uint amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, IFarm _farm, IBalanceKeeper _balanceKeeper) {
        owner = _owner;
        farm = _farm;
        balanceKeeper = _balanceKeeper;
    }

    function setOwner(address _owner) public isOwner {
        owner = _owner;
    }

    function lpTokenCount() public view returns (uint) {
        return lpTokens.length;
    }

    function userCount(address lptoken) public view returns(uint) {
        return users[lptoken].length;
    }

    // permit/forbid an oracle to add user balances
    function toggleAdder(address adder) public isOwner {
        allowedAdders[adder] = !allowedAdders[adder];
        emit ToggleAdder(msg.sender, adder, allowedAdders[adder]);
    }

    // permit/forbid an oracle to subtract user balances
    function toggleSubtractor(address subtractor) public isOwner {
        allowedSubtractors[subtractor] = !allowedSubtractors[subtractor];
        emit ToggleSubtractor(msg.sender, subtractor, allowedSubtractors[subtractor]);
    }

    function addTokens(address lptoken,
                       address user,
                       uint amount) public {
        require(allowedAdders[msg.sender],"not allowed to add value");
        if (!lpTokenIsKnown[lptoken]) {
            lpTokens.push(lptoken);
            lpTokenIsKnown[lptoken] = true;
        }
        if (!userIsKnown[lptoken][user]) {
            users[lptoken].push(user);
            userIsKnown[lptoken][user] = true;
        }
        userBalance[lptoken][user] += amount;
        supply[lptoken] += amount;
        emit AddTokens(msg.sender, lptoken, user, amount);
    }

    function subtractTokens(address lptoken,
                            address user,
                            uint amount) public {
        require(allowedSubtractors[msg.sender],"not allowed to subtract");
        userBalance[lptoken][user] -= amount;
        supply[lptoken] -= amount;
        emit SubtractTokens(msg.sender, lptoken, user, amount);
    }

    function addUserBalance(address lptoken, address user) internal {
        uint amount = currentPortion[lptoken] * userBalance[lptoken][user] / supply[lptoken];
        balanceKeeper.addValue(user, amount);
    }

    function processBalancesForToken(address lptoken, uint step) public {
        if (supply[lptoken] <= 0) { return; } // skip if no supply for lptoken

        uint toValue = finalValue[lptoken] + step;
        if (finalValue[lptoken] == 0) {
            currentPortion[lptoken] = farm.totalUnlocked() - previousPortion[lptoken];
        }
        uint fromValue = finalValue[lptoken];
        if (toValue > userCount(lptoken)) {
            toValue = userCount(lptoken);
        }
        for(uint i = fromValue; i < toValue; i++) {
            address user = users[lptoken][i];
            addUserBalance(lptoken, user);
        }
        if (toValue == userCount(lptoken)) {
            finalValue[lptoken] = 0;
            previousPortion[lptoken] += currentPortion[lptoken];
        } else {
            finalValue[lptoken] = toValue;
        }
    }

    function processBalances(uint step) public {
        for(uint i = 0; i < lpTokenCount(); i++) {
            address lptoken = lpTokens[i];
            processBalancesForToken(lptoken, step);
            while (finalValue[lptoken] != 0) {
              processBalancesForToken(lptoken, step);
            }
        }
    }
}
