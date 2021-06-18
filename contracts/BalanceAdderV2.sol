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
    uint[] public override lastPortions;
    uint public override totalFarms;

    uint public override lastUser;
    uint public override currentFarm;
    uint public override currentPortion;
    uint public override totalUnlocked;
    uint public override totalBalance;
    uint public override totalUsers;

    IBalanceKeeperV2 public override balanceKeeper;

    mapping (uint => bool) public override isProcessing;

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
    function removeFarm(uint farmId) external override isOwner {
        require(!isProcessing[currentFarm], "farm is processing balances");

        IShares[] memory newShares = new IShares[](shares.length-1);
        uint j = 0;
        for (uint i = 0; i < shares.length; i++) {
            if (i == farmId) {
                continue;
            }
            newShares[j] = shares[i];
            j++;
        }
        shares = newShares;
        
        IFarm[] memory newFarms = new IFarm[](farms.length-1);
        j = 0;
        for (uint i = 0; i < farms.length; i++) {
            if (i == farmId) {
                continue;
            }
            newFarms[j] = farms[i];
            j++;
        }
        farms = newFarms;
        
        uint[] memory newLastPortions = new uint[](lastPortions.length-1);
        j = 0;
        for (uint i = 0; i < lastPortions.length; i++) {
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
    function processBalances(uint step) external override {
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

        uint toUser = lastUser + step;
        uint fromUser = lastUser;

        if (toUser > totalUsers) {
            toUser = totalUsers;
        }

        for(uint i = fromUser; i < toUser; i++) {
            require(shares[currentFarm].totalShares() > 0, "there are no shares");
            uint add = shares[currentFarm].shareById(i) * currentPortion / totalBalance;
            balanceKeeper.add(i, add);
        }

        if (toUser == totalUsers) {
            lastUser = 0;
            lastPortions[currentFarm] = totalUnlocked;
            isProcessing[currentFarm] = false;
            if (currentFarm == farms.length-1) {
                currentFarm = 0;
            } else {
                currentFarm++;
            }
        } else {
            lastUser = toUser;
        }
    }
}
