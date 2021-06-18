//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ILPKeeperV2.sol";

/// @title LPKeeperV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract LPKeeperV2 is ILPKeeperV2 {
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // oracles for changing user lp balances
    mapping(address => bool) public override canAdd;
    mapping(address => bool) public override canSubtract;
    mapping(address => bool) public override canOpen;

    // chain code => in chain address => user id;
    mapping(uint256 => string) internal _tokenChainById;
    mapping(uint256 => bytes) internal _tokenAddressById;
    mapping(string => mapping(bytes => uint256))
        internal _tokenIdByChainAddress;
    mapping(string => mapping(bytes => bool)) internal _isKnownToken;

    uint256 public override totalTokens;
    mapping(uint256 => uint256) internal _totalUsers;
    mapping(uint256 => uint256) internal _totalBalance;
    mapping(uint256 => mapping(uint256 => uint256)) internal _balance;
    mapping(uint256 => mapping(uint256 => uint256)) internal _tokenUser;
    mapping(uint256 => mapping(uint256 => bool)) internal _isKnownTokenUser;

    IBalanceKeeperV2 public override balanceKeeper;

    event SetOwner(address ownerOld, address ownerNew);
    event SetCanOpen(
        address indexed owner,
        address indexed opener,
        bool indexed newBool
    );
    event SetCanAdd(
        address indexed owner,
        address indexed adder,
        bool indexed newBool
    );
    event SetCanSubtract(
        address indexed owner,
        address indexed subtractor,
        bool indexed newBool
    );
    event Add(
        address indexed adder,
        uint256 indexed tokenId,
        uint256 indexed userId,
        uint256 amount
    );
    event Subtract(
        address indexed subtractor,
        uint256 indexed tokenId,
        uint256 indexed userId,
        uint256 amount
    );

    constructor(address _owner, IBalanceKeeperV2 _balanceKeeper) {
        owner = _owner;
        balanceKeeper = _balanceKeeper;
    }

    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setCanOpen(address opener, bool _canOpen)
        external
        override
        isOwner
    {
        canOpen[opener] = _canOpen;
        emit SetCanOpen(msg.sender, opener, canOpen[opener]);
    }

    // permit/forbid an oracle to add user balances
    function setCanAdd(address adder, bool _canAdd) external override isOwner {
        canAdd[adder] = _canAdd;
        emit SetCanAdd(msg.sender, adder, canAdd[adder]);
    }

    // permit/forbid an oracle to subtract user balances
    function setCanSubtract(address subtractor, bool _canSubtract)
        external
        override
        isOwner
    {
        canSubtract[subtractor] = _canSubtract;
        emit SetCanSubtract(msg.sender, subtractor, canSubtract[subtractor]);
    }

    function isKnownToken(uint256 tokenId) public view override returns (bool) {
        return tokenId < totalTokens;
    }

    function isKnownToken(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) public view override returns (bool) {
        return _isKnownToken[tokenChain][tokenAddress];
    }

    function tokenChainById(uint256 tokenId)
        external
        view
        override
        returns (string memory)
    {
        require(isKnownToken(tokenId), "token is not known");
        return _tokenChainById[tokenId];
    }

    function tokenAddressById(uint256 tokenId)
        external
        view
        override
        returns (bytes memory)
    {
        require(isKnownToken(tokenId), "token is not known");
        return _tokenAddressById[tokenId];
    }

    function tokenChainAddressById(uint256 tokenId)
        external
        view
        override
        returns (string memory, bytes memory)
    {
        require(isKnownToken(tokenId), "token is not known");
        return (_tokenChainById[tokenId], _tokenAddressById[tokenId]);
    }

    function tokenIdByChainAddress(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) public view override returns (uint256) {
        require(isKnownToken(tokenChain, tokenAddress), "token is not known");
        return _tokenIdByChainAddress[tokenChain][tokenAddress];
    }

    function isKnownTokenUser(uint256 tokenId, uint256 userId)
        external
        view
        override
        returns (bool)
    {
        return _isKnownTokenUser[tokenId][userId];
    }

    function isKnownTokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId
    ) external view override returns (bool) {
        uint256 tokenId = _tokenIdByChainAddress[tokenChain][tokenAddress];
        return _isKnownTokenUser[tokenId][userId];
    }

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

    function isKnownTokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress
    ) external view override returns (bool) {
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

    function tokenUser(uint256 tokenId, uint256 userIndex)
        external
        view
        override
        returns (uint256)
    {
        require(isKnownToken(tokenId), "token is not known");
        require(totalTokenUsers(tokenId) > 0, "no token users");
        require(
            userIndex < totalTokenUsers(tokenId),
            "token user is not known"
        );
        return _tokenUser[tokenId][userIndex];
    }

    function tokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userIndex
    ) external view override returns (uint256) {
        uint256 tokenId = _tokenIdByChainAddress[tokenChain][tokenAddress];
        require(isKnownToken(tokenId), "token is not known");
        require(totalTokenUsers(tokenId) > 0, "no token users");
        require(
            userIndex < totalTokenUsers(tokenId),
            "token user is not known"
        );
        return _tokenUser[tokenId][userIndex];
    }

    function totalTokenUsers(uint256 tokenId)
        public
        view
        override
        returns (uint256)
    {
        return _totalUsers[tokenId];
    }

    function totalTokenUsers(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view override returns (uint256) {
        if (!isKnownToken(tokenChain, tokenAddress)) {
            return 0;
        }
        return _totalUsers[_tokenIdByChainAddress[tokenChain][tokenAddress]];
    }

    function balance(uint256 tokenId, uint256 userId)
        external
        view
        override
        returns (uint256)
    {
        return _balance[tokenId][userId];
    }

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

    function totalBalance(uint256 tokenId)
        external
        view
        override
        returns (uint256)
    {
        return _totalBalance[tokenId];
    }

    function totalBalance(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view override returns (uint256) {
        return _totalBalance[_tokenIdByChainAddress[tokenChain][tokenAddress]];
    }

    function open(string calldata tokenChain, bytes calldata tokenAddress)
        external
        override
    {
        require(canOpen[msg.sender], "not allowed to open");
        if (!isKnownToken(tokenChain, tokenAddress)) {
            uint256 tokenId = totalTokens;
            _tokenChainById[tokenId] = tokenChain;
            _tokenAddressById[tokenId] = tokenAddress;
            _tokenIdByChainAddress[tokenChain][tokenAddress] = tokenId;
            _isKnownToken[tokenChain][tokenAddress] = true;
            totalTokens++;
        }
    }

    function add(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) external override {
        require(canAdd[msg.sender], "not allowed to add");
        require(isKnownToken(tokenId), "token is not known");
        require(balanceKeeper.isKnownUser(userId), "user is not known");
        _add(tokenId, userId, amount);
    }

    function add(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external override {
        require(canAdd[msg.sender], "not allowed to add");
        require(isKnownToken(tokenId), "token is not known");
        uint256 userId = balanceKeeper.userIdByChainAddress(
            userChain,
            userAddress
        );
        _add(tokenId, userId, amount);
    }

    function add(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId,
        uint256 amount
    ) external override {
        require(canAdd[msg.sender], "not allowed to add");
        uint256 tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        require(balanceKeeper.isKnownUser(userId), "user is not known");
        _add(tokenId, userId, amount);
    }

    function add(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external override {
        require(canAdd[msg.sender], "not allowed to add");
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

    function subtract(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) external override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        require(isKnownToken(tokenId), "token is not known");
        require(balanceKeeper.isKnownUser(userId), "user is not known");
        _subtract(tokenId, userId, amount);
    }

    function subtract(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        require(isKnownToken(tokenId), "token is not known");
        uint256 userId = balanceKeeper.userIdByChainAddress(
            userChain,
            userAddress
        );
        _subtract(tokenId, userId, amount);
    }

    function subtract(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId,
        uint256 amount
    ) external override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        uint256 tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        require(balanceKeeper.isKnownUser(userId), "user is not known");
        _subtract(tokenId, userId, amount);
    }

    function subtract(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external override {
        require(canSubtract[msg.sender], "not allowed to subtract");
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
