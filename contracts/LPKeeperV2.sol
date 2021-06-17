//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/ILPKeeperV2.sol';
import './interfaces/IBalanceKeeperV2.sol';

/// @title LPKeeperV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract LPKeeperV2 is ILPKeeperV2 {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // oracles for changing user lp balances
    mapping (address => bool) public canAdd;
    mapping (address => bool) public canSubtract;
    mapping (address => bool) public canOpen;

    // chain code => in chain address => user id;
    mapping (uint => string) internal _tokenChainById;
    mapping (uint => bytes) internal _tokenAddressById;
    mapping (string => mapping (bytes => uint)) internal _tokenIdByChainAddress;
    mapping (string => mapping (bytes => bool)) internal _isKnownToken;

    uint public override totalTokens;
    mapping (uint => uint) internal _totalUsers;
    mapping (uint => uint) internal _totalBalance;
    mapping (uint => mapping (uint => uint)) internal _balance;
    mapping (uint => mapping (uint => uint)) internal _tokenUser;
    mapping (uint => mapping (uint => bool)) internal _isKnownTokenUser;

    IBalanceKeeperV2 balanceKeeper;

    event SetOwner
        (address ownerOld,
         address ownerNew);
    event SetCanOpen
        (address indexed owner,
         address indexed opener,
         bool indexed newBool);
    event SetCanAdd
        (address indexed owner,
         address indexed adder,
         bool indexed newBool);
    event SetCanSubtract
        (address indexed owner,
         address indexed subtractor,
         bool indexed newBool);
    event Add
        (address indexed adder,
         uint indexed tokenId,
         uint indexed userId,
         uint amount);
    event Subtract
        (address indexed subtractor,
         uint indexed tokenId,
         uint indexed userId,
         uint amount);

    constructor(address _owner, IBalanceKeeperV2 _balanceKeeper) {
        owner = _owner;
        balanceKeeper = _balanceKeeper;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setCanOpen(address opener, bool _canOpen) public isOwner {
        canOpen[opener] = _canOpen;
        emit SetCanOpen(msg.sender, opener, canOpen[opener]);
    }

    // permit/forbid an oracle to add user balances
    function setCanAdd(address adder, bool _canAdd) public isOwner {
        canAdd[adder] = _canAdd;
        emit SetCanAdd(msg.sender, adder, canAdd[adder]);
    }

    // permit/forbid an oracle to subtract user balances
    function setCanSubtract(address subtractor, bool _canSubtract) public isOwner {
        canSubtract[subtractor] = _canSubtract;
        emit SetCanSubtract(msg.sender, subtractor, canSubtract[subtractor]);
    }

    function isKnownToken(uint tokenId) public view override returns (bool) {
        return tokenId < totalTokens;
    }

    function isKnownToken(string calldata tokenChain, bytes calldata tokenAddress) public view override returns (bool) {
        return _isKnownToken[tokenChain][tokenAddress];
    }

    function tokenChainById(uint tokenId) public view override returns (string memory) {
        require(isKnownToken(tokenId), "token is not known");
        return _tokenChainById[tokenId];
    }

    function tokenAddressById(uint tokenId) public view override returns (bytes memory) {
        require(isKnownToken(tokenId), "token is not known");
        return _tokenAddressById[tokenId];
    }

    function tokenChainAddressById(uint tokenId) public view override returns (string memory, bytes memory) {
        require(isKnownToken(tokenId), "token is not known");
        return (_tokenChainById[tokenId], _tokenAddressById[tokenId]);
    }

    function tokenIdByChainAddress(string calldata tokenChain, bytes calldata tokenAddress) public view override returns (uint) {
        require(isKnownToken(tokenChain, tokenAddress), "token is not known");
        return _tokenIdByChainAddress[tokenChain][tokenAddress];
    }

    function isKnownTokenUser(uint tokenId, uint userId) public view override returns (bool) {
        return _isKnownTokenUser[tokenId][userId];
    }

    function isKnownTokenUser(string calldata tokenChain, bytes calldata tokenAddress, uint userId) public view override returns (bool) {
        uint tokenId = _tokenIdByChainAddress[tokenChain][tokenAddress];
        return _isKnownTokenUser[tokenId][userId];
    }

    function isKnownTokenUser(uint tokenId, string calldata userChain, bytes calldata userAddress) public view override returns (bool) {
        if (!balanceKeeper.isKnownUser(userChain, userAddress)) {
            return false;
        }
        uint userId = balanceKeeper.userIdByChainAddress(userChain, userAddress);
        return _isKnownTokenUser[tokenId][userId];
    }

    function isKnownTokenUser(string calldata tokenChain, bytes calldata tokenAddress, string calldata userChain, bytes calldata userAddress) public view override returns (bool) {
        uint tokenId = _tokenIdByChainAddress[tokenChain][tokenAddress];
        if (!balanceKeeper.isKnownUser(userChain, userAddress)) {
            return false;
        }
        uint userId = balanceKeeper.userIdByChainAddress(userChain, userAddress);
        return _isKnownTokenUser[tokenId][userId];
    }

    function tokenUser(uint tokenId, uint userIndex) public view override returns (uint) {
        require(isKnownToken(tokenId), "token is not known");
        require(totalTokenUsers(tokenId) > 0, "no token users");
        require(userIndex < totalTokenUsers(tokenId), "token user is not known");
        return _tokenUser[tokenId][userIndex];
    }

    function tokenUser(string calldata tokenChain, bytes calldata tokenAddress, uint userIndex) public view override returns (uint) {
        uint tokenId = _tokenIdByChainAddress[tokenChain][tokenAddress];
        require(isKnownToken(tokenId), "token is not known");
        require(totalTokenUsers(tokenId) > 0, "no token users");
        require(userIndex < totalTokenUsers(tokenId), "token user is not known");
        return _tokenUser[tokenId][userIndex];
    }

    function totalTokenUsers(uint tokenId) public view override returns (uint) {
        return _totalUsers[tokenId];
    }

    function totalTokenUsers
        (string calldata tokenChain,
         bytes calldata tokenAddress)
        public view override returns (uint) {
        if (!isKnownToken(tokenChain, tokenAddress)) {
            return 0;
        }
        return _totalUsers[_tokenIdByChainAddress[tokenChain][tokenAddress]];
    }


    function balance(uint tokenId, uint userId) public view override returns (uint) {
        return _balance[tokenId][userId];
    }

    function balance
        (uint tokenId,
         string calldata userChain,
         bytes calldata userAddress)
        public view override returns (uint) {
        if (!balanceKeeper.isKnownUser(userChain, userAddress)) {
            return 0;
        }
        uint userId = balanceKeeper.userIdByChainAddress(userChain, userAddress);
        return _balance[tokenId][userId];
    }

    function balance
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         uint userId)
        public view override returns (uint) {
        if (!isKnownToken(tokenChain, tokenAddress)) {
            return 0;
        }
        uint tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        return _balance[tokenId][userId];
    }

    function balance
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         string calldata userChain,
         bytes calldata userAddress)
        public view override returns (uint) {
        if (!isKnownToken(tokenChain, tokenAddress)) {
            return 0;
        }
        uint tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        if (!balanceKeeper.isKnownUser(userChain, userAddress)) {
            return 0;
        }
        uint userId = balanceKeeper.userIdByChainAddress(userChain, userAddress);
        return _balance[tokenId][userId];
    }

    function totalBalance(uint tokenId) public view override returns (uint) {
        return _totalBalance[tokenId];
    }

    function totalBalance
        (string calldata tokenChain,
         bytes calldata tokenAddress)
        public view override returns (uint) {
        return _totalBalance[_tokenIdByChainAddress[tokenChain][tokenAddress]];
    }

    function open(string calldata tokenChain, bytes calldata tokenAddress) public override {
        require(canOpen[msg.sender], "not allowed to open");
        if (!isKnownToken(tokenChain, tokenAddress)) {
            uint tokenId = totalTokens;
            _tokenChainById[tokenId] = tokenChain;
            _tokenAddressById[tokenId] = tokenAddress;
            _tokenIdByChainAddress[tokenChain][tokenAddress] = tokenId;
            _isKnownToken[tokenChain][tokenAddress] = true;
            totalTokens++;
        }
    }

    function add(uint tokenId,
                 uint userId,
                 uint amount) public override {
        require(canAdd[msg.sender], "not allowed to add");
        require(isKnownToken(tokenId), "token is not known");
        require(balanceKeeper.isKnownUser(userId), "user is not known");
        _add(tokenId, userId, amount);
    }

    function add(uint tokenId,
                 string calldata userChain,
                 bytes calldata userAddress,
                 uint amount) public override {
        require(canAdd[msg.sender], "not allowed to add");
        require(isKnownToken(tokenId), "token is not known");
        uint userId = balanceKeeper.userIdByChainAddress(userChain, userAddress);
        _add(tokenId, userId, amount);
    }

    function add(string calldata tokenChain,
                 bytes calldata tokenAddress,
                 uint userId,
                 uint amount) public override {
        require(canAdd[msg.sender], "not allowed to add");
        uint tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        require(balanceKeeper.isKnownUser(userId), "user is not known");
        _add(tokenId, userId, amount);
    }

    function add(string calldata tokenChain,
                 bytes calldata tokenAddress,
                 string calldata userChain,
                 bytes calldata userAddress,
                 uint amount) public override {
        require(canAdd[msg.sender], "not allowed to add");
        uint tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        uint userId = balanceKeeper.userIdByChainAddress(userChain, userAddress);
        _add(tokenId, userId, amount);
    }

    function _add(uint tokenId, uint userId, uint amount) internal {
        if (!_isKnownTokenUser[tokenId][userId] && amount > 0) {
            _isKnownTokenUser[tokenId][userId] = true;
            _tokenUser[tokenId][_totalUsers[tokenId]] = userId;
            _totalUsers[tokenId]++;
        }
        _balance[tokenId][userId] += amount;
        _totalBalance[tokenId] += amount;
        emit Add(msg.sender, tokenId, userId, amount);
    }

    function subtract(uint tokenId,
                      uint userId,
                      uint amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        require(isKnownToken(tokenId), "token is not known");
        require(balanceKeeper.isKnownUser(userId), "user is not known");
        _subtract(tokenId, userId, amount);
    }

    function subtract(uint tokenId,
                      string calldata userChain,
                      bytes calldata userAddress,
                      uint amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        require(isKnownToken(tokenId), "token is not known");
        uint userId = balanceKeeper.userIdByChainAddress(userChain, userAddress);
        _subtract(tokenId, userId, amount);
    }

    function subtract(string calldata tokenChain,
                      bytes calldata tokenAddress,
                      uint userId,
                      uint amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        uint tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        require(balanceKeeper.isKnownUser(userId), "user is not known");
        _subtract(tokenId, userId, amount);
    }

    function subtract(string calldata tokenChain,
                      bytes calldata tokenAddress,
                      string calldata userChain,
                      bytes calldata userAddress,
                      uint amount) public override {
        require(canSubtract[msg.sender], "not allowed to subtract");
        uint tokenId = tokenIdByChainAddress(tokenChain, tokenAddress);
        uint userId = balanceKeeper.userIdByChainAddress(userChain, userAddress);
        _subtract(tokenId, userId, amount);
    }

    function _subtract(uint tokenId, uint userId, uint amount) internal {
        _balance[tokenId][userId] -= amount;
        _totalBalance[tokenId] -= amount;
        emit Subtract(msg.sender, tokenId, userId, amount);
    }

}
