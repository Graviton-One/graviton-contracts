//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ILockUnlockLP.sol";
import "./interfaces/ILPKeeperV2.sol";
import "./interfaces/IBalanceKeeperV2.sol";

/// @title LockUnlockLPOnchain
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract LockUnlockLPOnchain is ILockUnlockLP {

    /// @inheritdoc ILockUnlockLP
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc ILockUnlockLP
    mapping(address => bool) public override isAllowedToken;
    /// @inheritdoc ILockUnlockLP
    mapping(address => uint256) public override lockLimit;
    mapping(address => mapping(address => uint256)) internal _balance;
    /// @inheritdoc ILockUnlockLP
    mapping(address => uint256) public override tokenSupply;
    /// @inheritdoc ILockUnlockLP
    uint256 public override totalSupply;

    /// @inheritdoc ILockUnlockLP
    bool public override canLock;

    IBalanceKeeperV2 public balanceKeeper;
    ILPKeeperV2 public lpKeeper;

    constructor(address[] memory allowedTokens, IBalanceKeeperV2 _balanceKeeper, ILPKeeperV2 _lpKeeper) {
        owner = msg.sender;
        for (uint256 i = 0; i < allowedTokens.length; i++) {
            isAllowedToken[allowedTokens[i]] = true;
        }
        balanceKeeper = _balanceKeeper;
        lpKeeper = _lpKeeper;
    }

    /// @inheritdoc ILockUnlockLP
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc ILockUnlockLP
    function setIsAllowedToken(address token, bool _isAllowedToken)
        external
        override
        isOwner
    {
        isAllowedToken[token] = _isAllowedToken;
        emit SetIsAllowedToken(owner, token, _isAllowedToken);
    }

    /// @inheritdoc ILockUnlockLP
    function setLockLimit(address token, uint256 _lockLimit)
        external
        override
        isOwner
    {
        lockLimit[token] = _lockLimit;
        emit SetLockLimit(owner, token, _lockLimit);
    }

    /// @inheritdoc ILockUnlockLP
    function setCanLock(bool _canLock) external override isOwner {
        canLock = _canLock;
        emit SetCanLock(owner, _canLock);
    }

    /// @inheritdoc ILockUnlockLP
    function balance(address token, address depositer)
        external
        view
        override
        returns (uint256)
    {
        return _balance[token][depositer];
    }

    /// @inheritdoc ILockUnlockLP
    function lock(
        address token,
        uint256 amount
    ) external override {
        require(canLock, "LP1");
        require(isAllowedToken[token], "LP2");
        require(amount >= lockLimit[token], "LP3");
        _balance[token][msg.sender] += amount;
        tokenSupply[token] += amount;
        totalSupply += amount;
        bytes memory tokenBytes = abi.encodePacked(token);
        bytes memory receiverBytes = abi.encodePacked(msg.sender);
        if (!balanceKeeper.isKnownUser("EVM", receiverBytes)) {
            balanceKeeper.open("EVM", receiverBytes);
        }
        if (!lpKeeper.isKnownToken("EVM", tokenBytes)) {
            lpKeeper.open("EVM", tokenBytes);
        }
        lpKeeper.add("EVM", tokenBytes, "EVM", receiverBytes, amount);
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit Lock(token, msg.sender, msg.sender, amount);
    }

    /// @inheritdoc ILockUnlockLP
    function unlock(
        address token,
        uint256 amount
    ) external override {
        require(_balance[token][msg.sender] >= amount, "LP4");
        _balance[token][msg.sender] -= amount;
        tokenSupply[token] -= amount;
        totalSupply -= amount;
        bytes memory tokenBytes = abi.encodePacked(token);
        bytes memory receiverBytes = abi.encodePacked(msg.sender);
        lpKeeper.subtract("EVM", tokenBytes, "EVM", receiverBytes, amount);
        IERC20(token).transfer(msg.sender, amount);
        emit Unlock(token, msg.sender, msg.sender, amount);
    }
}
