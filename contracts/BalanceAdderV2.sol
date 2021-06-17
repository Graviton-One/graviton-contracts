//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IFarm.sol';
import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/IBalanceAdder.sol';
import './interfaces/IShares.sol';

/// @title BalanceAdderV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderV2 is IBalanceAdder {
    
    // these are addresses of contracts that keeps users shares
    IShares[] public shares;
    IFarm[] public farms;
    uint[] public lastPortions;

    IBalanceKeeperV2 public balanceKeeper;

    uint public totalUnlocked;
    uint public lastUser;
    uint public totalUsers;
    uint public currentPortion;
    uint public lastFarm;
    
    address public owner;
    
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }
    
    function setOwner(address _owner) public isOwner {
        owner = _owner;
    }

    constructor(IBalanceKeeperV2 _balanceKeeper, address _owner) {
        balanceKeeper = _balanceKeeper;
        owner = _owner;
    }
    
    function addNewFarm(IShares _share, IFarm _farm) public isOwner {
        shares.push(_share);
        farms.push(_farm);
        lastPortions.push(0);
    }

    function removeFarm(uint farmId) public isOwner {
        require(lastFarm != farmId, "index is currently in process");
        // removing from array by index
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
    }

    // it iterates over all users but afer all are processed it forwards the index of array of current farm
    function processBalances(uint step) public override {
        if (lastUser == 0) {
            if (lastFarm >= shares.length) {
                lastFarm = 0;
            } else {
                lastFarm++;
            }
            totalUsers = balanceKeeper.totalUsers();
            totalUnlocked = farms[lastFarm].totalUnlocked();
            currentPortion = totalUnlocked - lastPortions[lastFarm];
        }
        uint toUser = lastUser + step;
        uint fromUser = lastUser;

        if (toUser > totalUsers) {
            toUser = totalUsers;
        }

        for(uint i = fromUser; i < toUser; i++) {
            //require(shares[lastFarm].totalShares() > 0, "there is no balance available for staking");
            uint add = shares[lastFarm].shareById(i) * currentPortion / shares[lastFarm].totalShares();
            balanceKeeper.add(i, add);
        }

        if (toUser == totalUsers) {
            lastUser = 0;
            lastPortions[lastFarm] = totalUnlocked;
        } else {
            lastUser = toUser;
        }
    }
}
