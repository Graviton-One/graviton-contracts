//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IERC20.sol";

/// @title LockGTON
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract LockGTON {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IERC20 public governanceToken;

    bool public canLock = false;

    event Lock
        (address indexed governanceToken,
         address indexed sender,
         address indexed receiver,
         uint amount);
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

    function setCanLock(bool _canLock) public isOwner {
        canLock = _canLock;
    }

    function migrate(address to, uint amount) public isOwner {
        governanceToken.transfer(to, amount);
    }

    function lock(address receiver, uint amount) public {
        require(canLock, "lock is not allowed");
        governanceToken.transferFrom(msg.sender, address(this), amount);
        emit Lock(address(governanceToken), msg.sender, receiver, amount);
    }
}
