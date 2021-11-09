//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/ILPKeeperV2.sol";

/// @title LPKeeperV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract LPKeeperV2 is ILPKeeperV2 {
    /// @inheritdoc ILPKeeperV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc ILPKeeperV2
    IBalanceKeeperV2 public override balanceKeeper;

    /// @inheritdoc ILPKeeperV2
    mapping(address => bool) public override canAdd;
    /// @inheritdoc ILPKeeperV2
    mapping(address => bool) public override canSubtract;
    /// @inheritdoc ILPKeeperV2
    mapping(address => bool) public override canOpen;

    mapping(uint256 => string) internal _tokenChainById;
    mapping(uint256 => bytes) internal _tokenAddressById;
    // @dev chain code => in chain address => user id;
    mapping(string => mapping(bytes => uint256))
        internal _tokenIdByChainAddress;
    mapping(string => mapping(bytes => bool)) internal _isKnownToken;

    /// @inheritdoc ILPKeeperV2
    uint256 public override totalTokens;
    mapping(uint256 => uint256) internal _totalUsers;
    mapping(uint256 => uint256) internal _totalBalance;
    mapping(uint256 => mapping(uint256 => uint256)) internal _balance;
    mapping(uint256 => mapping(uint256 => uint256)) internal _tokenUser;
    mapping(uint256 => mapping(uint256 => bool)) internal _isKnownTokenUser;

    constructor(IBalanceKeeperV2 _balanceKeeper) {
        owner = msg.sender;
        balanceKeeper = _balanceKeeper;
    }

    /// @inheritdoc ILPKeeperV2
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc ILPKeeperV2
    function setCanOpen(address opener, bool _canOpen)
        external
        override
        isOwner
    {
        canOpen[opener] = _canOpen;
        emit SetCanOpen(msg.sender, opener, canOpen[opener]);
    }

    /// @inheritdoc ILPKeeperV2
    function setCanAdd(address adder, bool _canAdd) external override isOwner {
        canAdd[adder] = _canAdd;
        emit SetCanAdd(msg.sender, adder, canAdd[adder]);
    }

    /// @inheritdoc ILPKeeperV2
    function setCanSubtract(address subtractor, bool _canSubtract)
        external
        override
        isOwner
    {
        canSubtract[subtractor] = _canSubtract;
        emit SetCanSubtract(msg.sender, subtractor, canSubtract[subtractor]);
    }

    /// @inheritdoc ILPKeeperV2
    function isKnownToken(uint256 tokenId) public view override returns (bool) {
        return tokenId < totalTokens;
    }

    /// @inheritdoc ILPKeeperV2
    function isKnownToken(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) public view override returns (bool) {
        return _isKnownToken[tokenChain][tokenAddress];
    }

    /// @inheritdoc ILPKeeperV2
    function tokenChainById(uint256 tokenId)
        external
        view
        override
        returns (string memory)
    {
        require(isKnownToken(tokenId), "LK1");
        return _tokenChainById[tokenId];
    }

    /// @inheritdoc ILPKeeperV2
    function tokenAddressById(uint256 tokenId)
        external
        view
        override
        returns (bytes memory)
    {
        require(isKnownToken(tokenId), "LK1");
        return _tokenAddressById[tokenId];
    }

    /// @inheritdoc ILPKeeperV2
    function tokenChainAddressById(uint256 tokenId)
        external
        view
        override
        returns (string memory, bytes memory)
    {
        require(isKnownToken(tokenId), "LK1");
        return (_tokenChainById[tokenId], _tokenAddressById[tokenId]);
    }

    /// @inheritdoc ILPKeeperV2
    function tokenIdByChainAddress(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) public view override returns (uint256) {
        require(isKnownToken(tokenChain, tokenAddress), "LK1");
        return _tokenIdByChainAddress[tokenChain][tokenAddress];
    }

    /// @inheritdoc ILPKeeperV2
    function isKnownTokenUser(uint256 tokenId, uint256 userId)
        external
        view
        override
        returns (bool)
    {
        return _isKnownTokenUser[tokenId][userId];
    }

    /// @inheritdoc ILPKeeperV2
    function isKnownTokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId
    ) external view override returns (bool) {
        if (!isKnownToken(tokenChain, tokenAddress)) {
            return false;
        }
        uint256 tokenId = _tokenIdByChainAddress[tokenChain][tokenAddress];
        return _isKnownTokenUser[tokenId][userId];
    }

    /// @inheritdoc ILPKeeperV2
    function isKnownTokenUser(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress
    ) external view override returns (bool) {
        if (!balanceKeeper.isKnownUser(userChain, userAddress)) {
            return false;
        }
        uint256 userId = balanceKeeper.userIdByChainAddress(
            userChain,
            userAddress
        );
        return _isKnownTokenUser[tokenId][userId];
    }

    /// @inheritdoc ILPKeeperV2
    function isKnownTokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress
    ) external view override returns (bool) {
        if (!isKnownToken(tokenChain, tokenAddress)) {
            return false;
        }
        uint256 tokenId = _tokenIdByChainAddress[tokenChain][tokenAddress];
        if (!balanceKeeper.isKnownUser(userChain, userAddress)) {
            return false;
        }
        uint256 userId = balanceKeeper.userIdByChainAddress(
            userChain,
            userAddress
        );
        return _isKnownTokenUser[tokenId][userId];
    }

    /// @inheritdoc ILPKeeperV2
    function tokenUser(uint256 tokenId, uint256 userIndex)
        external
        view
        override
        returns (uint256)
    {
        require(isKnownToken(tokenId), "LK1");
        require(totalTokenUsers(tokenId) > 0, "LK2");
        require(userIndex < totalTokenUsers(tokenId), "LK3");
        return _tokenUser[tokenId][userIndex];
    }

    /// @inheritdoc ILPKeeperV2
    function tokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userIndex
    ) external view override returns (uint256) {
        require(isKnownToken(tokenChain, tokenAddress), "LK1");
        uint256 tokenId = _tokenIdByChainAddress[tokenChain][tokenAddress];
        require(totalTokenUsers(tokenId) > 0, "LK2");
        require(userIndex < totalTokenUsers(tokenId), "LK3");
        return _tokenUser[tokenId][userIndex];
    }

    /// @inheritdoc ILPKeeperV2
    function totalTokenUsers(uint256 tokenId)
        public
        view
        override
        returns (uint256)
    {
        return _totalUsers[tokenId];
    }

    /// @inheritdoc ILPKeeperV2
    function totalTokenUsers(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view override returns (uint256) {
        if (!isKnownToken(tokenChain, tokenAddress)) {
            return 0;
        }
        return _totalUsers[_tokenIdByChainAddress[tokenChain][tokenAddress]];
    }

    /// @inheritdoc ILPKeeperV2
    function balance(uint256 tokenId, uint256 userId)
        external
        view
        override
        returns (uint256)
    {
        return _balance[tokenId][userId];
    }

    /// @inheritdoc ILPKeeperV2
    function balance(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress
    ) external view override returns (uint256) {
        if (!balanceKeeper.isKnownUser(userChain, userAddress)) {
            return 0;
        }
        uint256 userId = balanceKeeper.userIdByChainAddress(
            userChain,
            userAddress
        );
        return _balance[tokenId][userId];
    }

    /// @inheritdoc ILPKeeperV2
    function balance(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId
    ) external view override returns (uint256) {
        if (!isKnownToken(tokenChain, tokenAddress)) {
            return 0;
        }
        uint256 tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        return _balance[tokenId][userId];
    }

    /// @inheritdoc ILPKeeperV2
    function balance(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress
    ) external view override returns (uint256) {
        if (!isKnownToken(tokenChain, tokenAddress)) {
            return 0;
        }
        uint256 tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        if (!balanceKeeper.isKnownUser(userChain, userAddress)) {
            return 0;
        }
        uint256 userId = balanceKeeper.userIdByChainAddress(
            userChain,
            userAddress
        );
        return _balance[tokenId][userId];
    }

    /// @inheritdoc ILPKeeperV2
    function totalBalance(uint256 tokenId)
        external
        view
        override
        returns (uint256)
    {
        return _totalBalance[tokenId];
    }

    /// @inheritdoc ILPKeeperV2
    function totalBalance(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view override returns (uint256) {
        if (!isKnownToken(tokenChain, tokenAddress)) {
            return 0;
        }
        return _totalBalance[_tokenIdByChainAddress[tokenChain][tokenAddress]];
    }

    /// @inheritdoc ILPKeeperV2
    function open(string calldata tokenChain, bytes calldata tokenAddress)
        external
        override
    {
        require(canOpen[msg.sender], "ACO");
        if (!isKnownToken(tokenChain, tokenAddress)) {
            uint256 tokenId = totalTokens;
            _tokenChainById[tokenId] = tokenChain;
            _tokenAddressById[tokenId] = tokenAddress;
            _tokenIdByChainAddress[tokenChain][tokenAddress] = tokenId;
            _isKnownToken[tokenChain][tokenAddress] = true;
            totalTokens++;
            emit Open(msg.sender, tokenId);
        }
    }

    /// @inheritdoc ILPKeeperV2
    function add(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) external override {
        require(canAdd[msg.sender], "ACA");
        require(isKnownToken(tokenId), "LK1");
        require(balanceKeeper.isKnownUser(userId), "LK4");
        _add(tokenId, userId, amount);
    }

    /// @inheritdoc ILPKeeperV2
    function add(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external override {
        require(canAdd[msg.sender], "ACA");
        require(isKnownToken(tokenId), "LK1");
        uint256 userId = balanceKeeper.userIdByChainAddress(
            userChain,
            userAddress
        );
        _add(tokenId, userId, amount);
    }

    /// @inheritdoc ILPKeeperV2
    function add(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId,
        uint256 amount
    ) external override {
        require(canAdd[msg.sender], "ACA");
        uint256 tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        require(balanceKeeper.isKnownUser(userId), "LK4");
        _add(tokenId, userId, amount);
    }

    /// @inheritdoc ILPKeeperV2
    function add(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external override {
        require(canAdd[msg.sender], "ACA");
        uint256 tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        uint256 userId = balanceKeeper.userIdByChainAddress(
            userChain,
            userAddress
        );
        _add(tokenId, userId, amount);
    }

    function _add(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) internal {
        if (!_isKnownTokenUser[tokenId][userId] && amount > 0) {
            _isKnownTokenUser[tokenId][userId] = true;
            _tokenUser[tokenId][_totalUsers[tokenId]] = userId;
            _totalUsers[tokenId]++;
        }
        _balance[tokenId][userId] += amount;
        _totalBalance[tokenId] += amount;
        emit Add(msg.sender, tokenId, userId, amount);
    }

    /// @inheritdoc ILPKeeperV2
    function subtract(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) external override {
        require(canSubtract[msg.sender], "ACS");
        require(isKnownToken(tokenId), "LK1");
        require(balanceKeeper.isKnownUser(userId), "LK4");
        _subtract(tokenId, userId, amount);
    }

    /// @inheritdoc ILPKeeperV2
    function subtract(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external override {
        require(canSubtract[msg.sender], "ACS");
        require(isKnownToken(tokenId), "LK1");
        uint256 userId = balanceKeeper.userIdByChainAddress(
            userChain,
            userAddress
        );
        _subtract(tokenId, userId, amount);
    }

    /// @inheritdoc ILPKeeperV2
    function subtract(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId,
        uint256 amount
    ) external override {
        require(canSubtract[msg.sender], "ACS");
        uint256 tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        require(balanceKeeper.isKnownUser(userId), "LK4");
        _subtract(tokenId, userId, amount);
    }

    /// @inheritdoc ILPKeeperV2
    function subtract(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external override {
        require(canSubtract[msg.sender], "ACS");
        uint256 tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        uint256 userId = balanceKeeper.userIdByChainAddress(
            userChain,
            userAddress
        );
        _subtract(tokenId, userId, amount);
    }

    function _subtract(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) internal {
        _balance[tokenId][userId] -= amount;
        _totalBalance[tokenId] -= amount;
        emit Subtract(msg.sender, tokenId, userId, amount);
    }
}
