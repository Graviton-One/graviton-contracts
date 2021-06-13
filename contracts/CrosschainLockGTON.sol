//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IERC20.sol';

/// @title CrosschainLockGTON
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract CrosschainLockGTON {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IERC20 public governanceToken;

    bool public canLock = false;

    event LockGTON(address indexed governanceToken, address indexed sender, address indexed receiver, uint amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, IERC20 _governanceToken) {
        owner = _owner;
        governanceToken = _governanceToken;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setGovernanceToken(IERC20 _governanceToken) public isOwner {
        governanceToken = _governanceToken;
    }

    function setCanLock(bool _canLock) public isOwner {
        canLock = _canLock;
    }

    function migrate(address to, uint amount) public isOwner {
        governanceToken.transfer(to, amount);
    }

    function lockTokens(address receiver, uint amount) public {
        require(canLock, "can't lock");
        governanceToken.transferFrom(msg.sender, address(this), amount);
        emit LockGTON(address(governanceToken), msg.sender, receiver, amount);
    }

}
