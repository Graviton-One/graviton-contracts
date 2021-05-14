//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IERC20 {
    function mint(address _to, uint256 _value) external;
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
    function transfer(address _to, uint _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint _value) external returns (bool success);
    function balanceOf(address _owner) external view returns (uint balance);
}

interface IBalanceKeeper {
    function addValue(address user, uint value) external;
    function userBalance(address user) external returns (uint);
    function subtractValue(address user, uint value) external;
}

interface IFarm {
    function totalUnlocked() external returns (uint);
}

/// @title PortLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract PortLP {

    address public owner;
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IFarm public gtonEmissionFarm;
    IBalanceKeeper public balanceKeeper;
    IERC20 public lpToken;

    uint currentPortion;
    uint totalProcessed;
    uint finalValue;

    uint public totalLocked;

    mapping (address => uint) public impact;
    mapping (uint => address) public users;
    mapping (address => bool) public addedUsers;
    uint public userCount;

    constructor(address _owner, IFarm _gtonEmissionFarm, IBalanceKeeper _balanceKeeper, IERC20 _lpToken) {
        owner = _owner;
        lpToken = _lpToken;
        balanceKeeper = _balanceKeeper;
        gtonEmissionFarm = _gtonEmissionFarm;
    }

    function transferOwnership(address newOwnerAddress) public isOwner {
        owner = newOwnerAddress;
    }

    function setNewGtonFarmAddr(IFarm newGtonAddress) public isOwner {
        gtonEmissionFarm = newGtonAddress;
    }

    function addUserBalance(address user) internal {
        uint amount = currentPortion * impact[user] / totalLocked;
        balanceKeeper.addValue(user, amount);
    }

    function lockLP(uint amount) public {
        if (!addedUsers[msg.sender]) {
            users[userCount] = msg.sender;
            userCount++;
            addedUsers[msg.sender] = true;
        }
        require(lpToken.transferFrom(msg.sender, address(this), amount),"can't transfer");
        impact[msg.sender] += amount;
        totalLocked += amount;
    }

    function unlockLP(uint amount, address to) public {
        require(impact[msg.sender] >= amount,"not enough amount");
        require(lpToken.transfer(to, amount),"can't transfer amount");
        impact[msg.sender] -= amount;
        totalLocked -= amount;
    }

    function processImpacts(uint step) public {
        uint toValue = finalValue + step;
        if (finalValue == 0) {
            currentPortion = gtonEmissionFarm.totalUnlocked() - totalProcessed;
        }
        uint fromValue = finalValue;
        if (toValue > userCount){
            toValue = userCount;
        }
        for(uint i = fromValue; i <= toValue; i++) {
            address user = users[i];
            addUserBalance(user);
        }
        if (toValue == userCount) {
            finalValue = 0;
            totalProcessed += currentPortion;
        } else {
            finalValue = toValue;
        }
    }
}
