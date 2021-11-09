//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IBalanceKeeperV2.sol";

/// @title BalanceKeeperV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceKeeperV2 is IBalanceKeeperV2 {
    /// @inheritdoc IBalanceKeeperV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IBalanceKeeperV2
    mapping(address => bool) public override canAdd;
    /// @inheritdoc IBalanceKeeperV2
    mapping(address => bool) public override canSubtract;
    /// @inheritdoc IBalanceKeeperV2
    mapping(address => bool) public override canOpen;

    mapping(uint256 => string) internal _userChainById;
    mapping(uint256 => bytes) internal _userAddressById;
    mapping(string => mapping(bytes => uint256)) internal _userIdByChainAddress;
    mapping(string => mapping(bytes => bool)) internal _isKnownUser;

    /// @inheritdoc IBalanceKeeperV2
    uint256 public override totalUsers;
    /// @inheritdoc IBalanceKeeperV2
    uint256 public override totalBalance;
    mapping(uint256 => uint256) internal _balance;

    constructor() {
        owner = msg.sender;
    }

    /// @inheritdoc IBalanceKeeperV2
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IBalanceKeeperV2
    function setCanOpen(address opener, bool _canOpen)
        external
        override
        isOwner
    {
        canOpen[opener] = _canOpen;
        emit SetCanOpen(msg.sender, opener, canOpen[opener]);
    }

    /// @inheritdoc IBalanceKeeperV2
    function setCanAdd(address adder, bool _canAdd) external override isOwner {
        canAdd[adder] = _canAdd;
        emit SetCanAdd(msg.sender, adder, canAdd[adder]);
    }

    /// @inheritdoc IBalanceKeeperV2
    function setCanSubtract(address subtractor, bool _canSubtract)
        external
        override
        isOwner
    {
        canSubtract[subtractor] = _canSubtract;
        emit SetCanSubtract(msg.sender, subtractor, canSubtract[subtractor]);
    }

    /// @inheritdoc IBalanceKeeperV2
    function isKnownUser(uint256 userId) public view override returns (bool) {
        return userId < totalUsers;
    }

    /// @inheritdoc IBalanceKeeperV2
    function isKnownUser(string calldata userChain, bytes calldata userAddress)
        public
        view
        override
        returns (bool)
    {
        return _isKnownUser[userChain][userAddress];
    }

    /// @inheritdoc IBalanceKeeperV2
    function userChainById(uint256 userId)
        external
        view
        override
        returns (string memory)
    {
        require(isKnownUser(userId), "BK1");
        return _userChainById[userId];
    }

    /// @inheritdoc IBalanceKeeperV2
    function userAddressById(uint256 userId)
        external
        view
        override
        returns (bytes memory)
    {
        require(isKnownUser(userId), "BK1");
        return _userAddressById[userId];
    }

    /// @inheritdoc IBalanceKeeperV2
    function userChainAddressById(uint256 userId)
        external
        view
        override
        returns (string memory, bytes memory)
    {
        require(isKnownUser(userId), "BK1");
        return (_userChainById[userId], _userAddressById[userId]);
    }

    /// @inheritdoc IBalanceKeeperV2
    function userIdByChainAddress(
        string calldata userChain,
        bytes calldata userAddress
    ) external view override returns (uint256) {
        require(isKnownUser(userChain, userAddress), "BK1");
        return _userIdByChainAddress[userChain][userAddress];
    }

    /// @inheritdoc IBalanceKeeperV2
    function balance(uint256 userId) external view override returns (uint256) {
        return _balance[userId];
    }

    /// @inheritdoc IBalanceKeeperV2
    function balance(string calldata userChain, bytes calldata userAddress)
        external
        view
        override
        returns (uint256)
    {
        if (!isKnownUser(userChain, userAddress)) {
            return 0;
        }
        return _balance[_userIdByChainAddress[userChain][userAddress]];
    }

    /// @inheritdoc IBalanceKeeperV2
    function open(string calldata userChain, bytes calldata userAddress)
        external
        override
    {
        require(canOpen[msg.sender], "ACO");
        if (!isKnownUser(userChain, userAddress)) {
            uint256 userId = totalUsers;
            _userChainById[userId] = userChain;
            _userAddressById[userId] = userAddress;
            _userIdByChainAddress[userChain][userAddress] = userId;
            _isKnownUser[userChain][userAddress] = true;
            totalUsers++;
            emit Open(msg.sender, userId);
        }
    }

    /// @inheritdoc IBalanceKeeperV2
    function add(uint256 userId, uint256 amount) external override {
        require(canAdd[msg.sender], "ACA");
        require(isKnownUser(userId), "BK1");
        _add(userId, amount);
    }

    /// @inheritdoc IBalanceKeeperV2
    function add(
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external override {
        require(canAdd[msg.sender], "ACA");
        require(isKnownUser(userChain, userAddress), "BK1");
        _add(_userIdByChainAddress[userChain][userAddress], amount);
    }

    function _add(uint256 userId, uint256 amount) internal {
        _balance[userId] += amount;
        totalBalance += amount;
        emit Add(msg.sender, userId, amount);
    }

    /// @inheritdoc IBalanceKeeperV2
    function subtract(uint256 userId, uint256 amount) external override {
        require(canSubtract[msg.sender], "ACS");
        require(isKnownUser(userId), "BK1");
        _subtract(userId, amount);
    }

    /// @inheritdoc IBalanceKeeperV2
    function subtract(
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external override {
        require(canSubtract[msg.sender], "ACS");
        require(isKnownUser(userChain, userAddress), "BK1");
        _subtract(_userIdByChainAddress[userChain][userAddress], amount);
    }

    function _subtract(uint256 userId, uint256 amount) internal {
        _balance[userId] -= amount;
        totalBalance -= amount;
        emit Subtract(msg.sender, userId, amount);
    }

    /// @inheritdoc IShares
    function shareById(uint256 userId)
        external
        view
        override
        returns (uint256)
    {
        return _balance[userId];
    }

    /// @inheritdoc IShares
    function totalShares() external view override returns (uint256) {
        return totalBalance;
    }

    /// @inheritdoc IShares
    function userIdByIndex(uint256 index)
        external
        view
        override
        returns (uint256)
    {
        require(index < totalUsers, "BK2");
        return index;
    }
}
