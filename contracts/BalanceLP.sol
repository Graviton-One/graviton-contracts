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

/// @title BalanceLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceLP {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    uint public totalUsers;
    mapping (address => bool) public knownUsers;
    mapping (uint => address) public userAddresses;
    uint public totalLpTokens;
    mapping (address => bool) public knownLpTokens;
    mapping (uint => address) public lpTokens;
    mapping (address => mapping (address => uint)) balances;
    uint totalSupply;
    mapping (address => uint) LpSupply;

    event AddTokensEvent(address indexed lptoken,
                         address indexed sender,
                         address indexed receiver,
                         uint amount);
    event SubtractTokensEvent(address indexed lptoken,
                              address indexed sender,
                              address indexed receiver,
                              uint amount);

    constructor(address _owner) {
        owner = _owner;
    }

    function transferOwnership(address newOwner) public isOwner {
        owner = newOwner;
    }

    function addTokens(address lptoken,
                       address user,
                       uint amount) public {
        balances[lptoken][user] = balances[lptoken][user] + amount;
    }
    function subtractTokens(address lptoken,
                            address user,
                            uint amount) public {
        balances[lptoken][user] = balances[lptoken][user] - amount;
    }
}
