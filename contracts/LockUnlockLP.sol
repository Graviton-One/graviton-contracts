//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IERC20.sol";

/// @title LockUnlockLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract LockUnlockLP {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    mapping (address => bool) public isAllowedToken;
    mapping (address => mapping (address => uint)) internal _balance;
    mapping (address => uint) public tokenSupply;
    uint public totalSupply;

    event Lock(address indexed token,
               address indexed sender,
               address indexed receiver,
               uint amount);
    event Unlock(address indexed token,
                 address indexed sender,
                 address indexed receiver,
                 uint amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, address[] memory allowedTokens) {
        for (uint i = 0; i < allowedTokens.length; i++) {
            isAllowedToken[allowedTokens[i]] = true;
        }
        owner = _owner;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setIsAllowedToken(address token, bool _isAllowedToken) public isOwner {
        isAllowedToken[token] = _isAllowedToken;
    }

    function balance(address token, address depositer) public view returns (uint) {
        return _balance[token][depositer];
    }

    function lock(address token, address receiver, uint amount) public {
        require(isAllowedToken[token], "token not allowed");
        _balance[token][receiver] += amount;
        tokenSupply[token] += amount;
        totalSupply += amount;
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit Lock(token, msg.sender, receiver, amount);
    }

    function unlock(address token, address receiver, uint amount) public {
        require(isAllowedToken[token], "token not allowed");
        require(_balance[token][msg.sender] >= amount, "not enough balance");
        _balance[token][msg.sender] -= amount;
        tokenSupply[token] -= amount;
        totalSupply -= amount;
        IERC20(token).transfer(receiver, amount);
        emit Unlock(token, msg.sender, receiver, amount);
    }
}
