//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IERC20.sol';

/// @title CrosschainLockLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract CrosschainLockLP {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    mapping (address => bool) public tokenIsAllowed;
    mapping (address => mapping (address => uint)) public balances;
    uint public totalSupply;
    mapping (address => uint) public lpSupply;

    event LockLP(address indexed lptoken,
                 address indexed sender,
                 address indexed receiver,
                 uint amount);
    event UnlockLP(address indexed lptoken,
                   address indexed sender,
                   address indexed receiver,
                   uint amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, address[] memory allowedTokens) {
        for (uint i = 0; i < allowedTokens.length; i++) {
            tokenIsAllowed[allowedTokens[i]] = true;
        }
        owner = _owner;
    }

    function setOwner(address _owner) public isOwner {
        owner = _owner;
    }

    function setTokenIsAllowed(address tokenAddress, bool _tokenIsAllowed) public isOwner {
        tokenIsAllowed[tokenAddress] = _tokenIsAllowed;
    }

    function lockTokens(address tokenAddress, address receiver, uint amount) public {
        require(tokenIsAllowed[tokenAddress], "token not allowed");
        balances[tokenAddress][receiver] += amount;
        totalSupply += amount;
        lpSupply[tokenAddress] += amount;
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        emit LockLP(tokenAddress, msg.sender, receiver, amount);
    }

    function unlockTokens(address tokenAddress, address receiver, uint amount) public {
        require(tokenIsAllowed[tokenAddress], "token not allowed");
        require(balances[tokenAddress][msg.sender] >= amount, "not enough balance");
        balances[tokenAddress][msg.sender] -= amount;
        totalSupply -= amount;
        lpSupply[tokenAddress] -= amount;
        IERC20(tokenAddress).transfer(receiver, amount);
        emit UnlockLP(tokenAddress, msg.sender, receiver, amount);
    }

}
