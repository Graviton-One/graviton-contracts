//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IBalanceAdderV2.sol";

/// @title BalanceAdderV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderV2 is IBalanceAdderV2 {
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IShares[] public override shares;
    IFarm[] public override farms;
    uint256[] public override lastPortions;
    uint256 public override totalFarms;

    uint256 public override lastUser;
    uint256 public override currentFarm;
    uint256 public override currentPortion;
    uint256 public override totalUnlocked;
    uint256 public override totalBalance;
    uint256 public override totalUsers;

    IBalanceKeeperV2 public override balanceKeeper;

    mapping(uint256 => bool) public override isProcessing;

    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, IBalanceKeeperV2 _balanceKeeper) {
        owner = _owner;
        balanceKeeper = _balanceKeeper;
    }

    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function addFarm(IShares _share, IFarm _farm) external override isOwner {
        shares.push(_share);
        farms.push(_farm);
        lastPortions.push(0);
        totalFarms++;
    }

    // remove index from arrays
    function removeFarm(uint256 farmId) external override isOwner {
        require(!isProcessing[currentFarm], "farm is processing balances");

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
        totalFarms--;
    }

    // iterates over all users and then increments current farm index
    function processBalances(uint256 step) external override {
        if (currentFarm >= farms.length) {
            return;
        }

        if (lastUser == 0) {
            isProcessing[currentFarm] = true;
            totalUsers = balanceKeeper.totalUsers();
            totalBalance = shares[currentFarm].totalShares();
            totalUnlocked = farms[currentFarm].totalUnlocked();
            currentPortion = totalUnlocked - lastPortions[currentFarm];
        }

        uint256 toUser = lastUser + step;
        uint256 fromUser = lastUser;

        if (toUser > totalUsers) {
            toUser = totalUsers;
        }

        for (uint256 i = fromUser; i < toUser; i++) {
            require(
                shares[currentFarm].totalShares() > 0,
                "there are no shares"
            );
            uint256 add = (shares[currentFarm].shareById(i) * currentPortion) /
                totalBalance;
            balanceKeeper.add(i, add);
        }

        if (toUser == totalUsers) {
            lastUser = 0;
            lastPortions[currentFarm] = totalUnlocked;
            isProcessing[currentFarm] = false;
            if (currentFarm == farms.length - 1) {
                currentFarm = 0;
            } else {
                currentFarm++;
            }
        } else {
            lastUser = toUser;
        }
    }
}
