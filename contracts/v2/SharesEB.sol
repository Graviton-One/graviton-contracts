//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/ISharesEB.sol";

/// @title SharesEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract SharesEB is ISharesEB {
    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }
    /// @inheritdoc ISharesEB
    IBalanceKeeperV2 public override balanceKeeper;
    /// @inheritdoc ISharesEB
    IImpactKeeper public override impactEB;

    /// @inheritdoc ISharesEB
    mapping(uint256 => uint256) public override impactById;
    /// @inheritdoc ISharesEB
    uint256 public override totalSupply;
    /// @inheritdoc ISharesEB
    uint256 public override currentUser;
    /// @inheritdoc IShares
    uint256 public override totalUsers;
    // @dev userIndex => userId
    mapping(uint256 => uint256) internal _userIdByIndex;
    // @dev userId => isKnown
    mapping(uint256 => bool) internal userIsKnown;

    event Transfer(uint256 from, uint256 to, uint256 amount);
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    constructor(IBalanceKeeperV2 _balanceKeeper, IImpactKeeper _impactEB) {
        balanceKeeper = _balanceKeeper;
        impactEB = _impactEB;
    }

    function setOwner(address _owner) external isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc ISharesEB
    function migrate(uint256 step) external override {
        uint256 toUser = currentUser + step;
        if (toUser > impactEB.userCount()) {
            toUser = impactEB.userCount();
        }
        for (uint256 i = currentUser; i < toUser; i++) {
            address user = impactEB.users(i);
            bytes memory userAddress = abi.encodePacked(user);
            if (!balanceKeeper.isKnownUser("EVM", userAddress)) {
                balanceKeeper.open("EVM", userAddress);
            }
            uint256 userId = balanceKeeper.userIdByChainAddress(
                "EVM",
                userAddress
            );
            impactById[userId] = impactEB.impact(user);
            _userIdByIndex[totalUsers] = userId;
            userIsKnown[userId] = true;
            totalUsers++;
            emit Migrate(user, userId, impactById[userId]);
        }
        // @dev moved here from the constructor to test different impactEB states
        totalSupply = impactEB.totalSupply();
        currentUser = toUser;
    }

    function transfer(
        uint256 from,
        uint256 to,
        uint256 amount
    ) external isOwner {
        require(balanceKeeper.isKnownUser(to), "S1");
        impactById[from] - amount;
        impactById[to] + amount;
        if (!userIsKnown[to]) {
            _userIdByIndex[totalUsers] = to;
            totalUsers++;
            userIsKnown[to] = true;
        }
        emit Transfer(from, to, amount);
    }

    /// @inheritdoc IShares
    function shareById(uint256 userId)
        external
        view
        override
        returns (uint256)
    {
        return impactById[userId];
    }

    /// @inheritdoc IShares
    function totalShares() external view override returns (uint256) {
        return totalSupply;
    }

    /// @inheritdoc IShares
    function userIdByIndex(uint256 index)
        external
        view
        override
        returns (uint256)
    {
        require(index < totalUsers, "EBI");
        return _userIdByIndex[index];
    }
}
