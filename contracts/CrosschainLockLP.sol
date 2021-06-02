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

/// @title CrosschainLockLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract CrosschainLockLP {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    mapping (address => bool) allowedTokens;
    mapping (address => mapping (address => uint)) balances;
    uint totalSupply;
    mapping (address => uint) LpSupply;

    event LockTokensEvent(address indexed lptoken,
                          address indexed sender,
                          address indexed receiver,
                          uint amount);
    event UnlockTokensEvent(address indexed lptoken,
                            address indexed sender,
                            address indexed receiver,
                            uint amount);

    constructor(address _owner, address[] memory _allowedTokens) {
        for (uint i = 0; i < _allowedTokens.length; i++) {
            allowedTokens[_allowedTokens[i]] = true;
        }
        owner = _owner;
    }

    function transferOwnership(address newOwner) public isOwner {
        owner = newOwner;
    }

    function toggleToken(address tokenAddress) public isOwner {
        allowedTokens[tokenAddress] = !allowedTokens[tokenAddress];
    }

    function lockTokens(address tokenAddress, address receiver, uint amount) public {
        require(allowedTokens[tokenAddress], "token not allowed");
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "not enough allowance");
        balances[tokenAddress][receiver] += amount;
        totalSupply += amount;
        LpSupply[tokenAddress] += amount;
        emit LockTokensEvent(tokenAddress, msg.sender, receiver, amount);
    }

    function unlockTokens(address tokenAddress, address receiver, uint amount) public {
        require(allowedTokens[tokenAddress], "token not allowed");
        require(balances[tokenAddress][msg.sender] >= amount, "not enough balance");
        IERC20(tokenAddress).transfer(receiver, amount);
        balances[tokenAddress][msg.sender] -= amount;
        totalSupply -= amount;
        LpSupply[tokenAddress] -= amount;
        emit UnlockTokensEvent(tokenAddress, msg.sender, receiver, amount);
    }

}
