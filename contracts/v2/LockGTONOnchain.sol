//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/ILockGTON.sol";
import "../interfaces/IBalanceKeeperV2.sol";

/// @title LockGTONOnchain
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract LockGTONOnchain is ILockGTON {
    /// @inheritdoc ILockGTON
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc ILockGTON
    IERC20 public override governanceToken;

    IBalanceKeeperV2 public balanceKeeper;

    /// @inheritdoc ILockGTON
    bool public override canLock;

    constructor(IERC20 _governanceToken, IBalanceKeeperV2 _balanceKeeper) {
        owner = msg.sender;
        governanceToken = _governanceToken;
        balanceKeeper = _balanceKeeper;
    }

    /// @inheritdoc ILockGTON
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc ILockGTON
    function setCanLock(bool _canLock) external override isOwner {
        canLock = _canLock;
        emit SetCanLock(owner, _canLock);
    }

    /// @inheritdoc ILockGTON
    function migrate(address newLock) external override isOwner {
        uint256 amount = governanceToken.balanceOf(address(this));
        governanceToken.transfer(newLock, amount);
        emit Migrate(newLock, amount);
    }

    /// @inheritdoc ILockGTON
    function lock(uint256 amount) external override {
        require(canLock, "LG1");
        bytes memory receiverBytes = abi.encodePacked(msg.sender);
        if (!balanceKeeper.isKnownUser("EVM", receiverBytes)) {
            balanceKeeper.open("EVM", receiverBytes);
        }
        balanceKeeper.add("EVM", abi.encodePacked(receiverBytes), amount);
        governanceToken.transferFrom(msg.sender, address(this), amount);
        emit LockGTON(address(governanceToken), msg.sender, msg.sender, amount);
    }
}
