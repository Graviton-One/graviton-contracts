//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IBalanceAdderV2.sol";

/// @title BalanceAdderV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderV2 is IBalanceAdderV2 {
    /// @inheritdoc IBalanceAdderV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IBalanceAdderV2
    IShares[] public override shares;
    /// @inheritdoc IBalanceAdderV2
    IFarm[] public override farms;
    /// @inheritdoc IBalanceAdderV2
    uint256[] public override lastPortions;

    /// @inheritdoc IBalanceAdderV2
    uint256 public override currentUser;
    /// @inheritdoc IBalanceAdderV2
    uint256 public override currentFarm;
    /// @inheritdoc IBalanceAdderV2
    uint256 public override currentPortion;
    /// @inheritdoc IBalanceAdderV2
    uint256 public override totalUnlocked;
    /// @inheritdoc IBalanceAdderV2
    uint256 public override totalShares;
    /// @inheritdoc IBalanceAdderV2
    uint256 public override totalUsers;

    /// @inheritdoc IBalanceAdderV2
    IBalanceKeeperV2 public override balanceKeeper;

    /// @inheritdoc IBalanceAdderV2
    mapping(uint256 => bool) public override isProcessing;

    constructor(IBalanceKeeperV2 _balanceKeeper) {
        owner = msg.sender;
        balanceKeeper = _balanceKeeper;
    }

    /// @inheritdoc IBalanceAdderV2
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IBalanceAdderV2
    function totalFarms() external view override returns (uint256) {
        return farms.length;
    }

    /// @inheritdoc IBalanceAdderV2
    function addFarm(IShares _share, IFarm _farm, uint256 _lastPortions) external override isOwner {
        shares.push(_share);
        farms.push(_farm);
        lastPortions.push(_lastPortions);
        emit AddFarm(farms.length, _share, _farm, _lastPortions);
    }

    /// @inheritdoc IBalanceAdderV2
    /// @dev remove index from arrays
    function removeFarm(uint256 farmId) external override isOwner {
        require(!isProcessing[currentFarm], "BA1");

        IShares oldShares = shares[farmId];
        IShares[] memory newShares = new IShares[](shares.length - 1);
        uint256 j = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            if (i == farmId) {
                continue;
            }
            newShares[j] = shares[i];
            j++;
        }
        shares = newShares;

        IFarm oldFarm = farms[farmId];
        IFarm[] memory newFarms = new IFarm[](farms.length - 1);
        j = 0;
        for (uint256 i = 0; i < farms.length; i++) {
            if (i == farmId) {
                continue;
            }
            newFarms[j] = farms[i];
            j++;
        }
        farms = newFarms;

        uint256 oldLastPortions = lastPortions[farmId];
        uint256[] memory newLastPortions = new uint256[](
            lastPortions.length - 1
        );
        j = 0;
        for (uint256 i = 0; i < lastPortions.length; i++) {
            if (i == farmId) {
                continue;
            }
            newLastPortions[j] = lastPortions[i];
            j++;
        }
        lastPortions = newLastPortions;

        emit RemoveFarm(farmId, oldShares, oldFarm, oldLastPortions);
    }

    /// @inheritdoc IBalanceAdderV2
    function processBalances(uint256 step) external override {
        /// @dev Return if there are no farming campaigns
        if (farms.length == 0) {
            return;
        }

        uint256 fromUser = currentUser;
        uint256 toUser = currentUser + step;

        if (!isProcessing[currentFarm] && toUser > 0) {
            isProcessing[currentFarm] = true;
            totalUsers = shares[currentFarm].totalUsers();
            totalShares = shares[currentFarm].totalShares();
            totalUnlocked = farms[currentFarm].totalUnlocked();
            currentPortion = totalUnlocked - lastPortions[currentFarm];
        }

        if (toUser > totalUsers) {
            toUser = totalUsers;
        }

        emit ProcessBalances(
            currentFarm,
            shares[currentFarm],
            farms[currentFarm],
            step
        );

        if (totalShares > 0) {
            for (uint256 i = fromUser; i < toUser; i++) {
                uint256 userId = shares[currentFarm].userIdByIndex(i);
                uint256 add = (shares[currentFarm].shareById(userId) *
                    currentPortion) / totalShares;
                balanceKeeper.add(userId, add);
                emit ProcessBalance(
                    currentFarm,
                    shares[currentFarm],
                    farms[currentFarm],
                    userId,
                    add
                );
            }
        }

        if (toUser == totalUsers) {
            lastPortions[currentFarm] = totalUnlocked;
            isProcessing[currentFarm] = false;
            if (currentFarm == farms.length - 1) {
                currentFarm = 0;
            } else {
                currentFarm++;
            }
            currentUser = 0;
        } else {
            currentUser = toUser;
        }
    }
}
