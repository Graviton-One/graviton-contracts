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

/// @title CrosschainLockGTON
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract CrosschainLockGTON {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IERC20 public gtonToken;

    bool public canLock = false;

    event LockGTON(address indexed gton, address indexed sender, address indexed receiver, uint amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, IERC20 _gtonToken) {
        owner = _owner;
        gtonToken = _gtonToken;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setGtonToken(IERC20 newGton) public isOwner {
        gtonToken = newGton;
    }

    function toggleLock() public isOwner {
        canLock = !canLock;
    }

    function migrateGton(address to, uint amount) public isOwner {
        gtonToken.transfer(to, amount);
    }

    function lockTokens(address receiver, uint amount) public {
        require(canLock, "can't lock");
        gtonToken.transferFrom(msg.sender, address(this), amount);
        emit LockGTON(address(gtonToken), msg.sender, receiver, amount);
    }

}
