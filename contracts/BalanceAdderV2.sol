//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IFarm.sol';
import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/IBalanceAdder.sol';

/// @title BalanceAdderStaking
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderStaking is IBalanceAdder {
    
    // these are addresses of contracts that keeps users shares
    IBalanceAdderShares[] public shares;
    IFarm[] public farms;
    uint[] public lastPortions;

    IBalanceKeeperV2 public balanceKeeper;

    uint public totalUnlocked;
    uint public finalValue;
    uint public totalUsers;
    uint public currentPortion;
    uint public currentIndex;
    
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
    
    function addNewFarm(IBalanceAdderShares _share, IFarm _farm) public isOwner {
        shares.push(_share);
        farms.push(_farm);
        lastPortions.push(0);
    }
    
    function removeFarm(uint farmId) public isOwner {
        require(currentIndex != farmId, "index is currently in process");
        // removing from array by index
        IBalanceAdderShares[] memory newShares = new IBalanceAdderShares[](shares.length-1);
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
        if (finalValue == 0) {
            if (currentIndex >= shares.length) {
                currentIndex = 0;
            } else {
                currentIndex++;
            }
            totalUsers = balanceKeeper.totalUsers();
            totalUnlocked = farms[currentIndex].totalUnlocked();
            currentPortion = totalUnlocked - lastPortions[currentIndex];
        }
        uint toValue = finalValue + step;
        uint fromValue = finalValue;

        if (toValue > totalUsers) {
            toValue = totalUsers;
        }

        for(uint i = fromValue; i < toValue; i++) {
            //require(shares[currentIndex].getTotal() > 0, "there is no balance available for staking");
            uint add = shares[currentIndex].getShareById(i) * currentPortion / shares[currentIndex].getTotal();
            balanceKeeper.addById(i, add);
        }

        if (toValue == totalUsers) {
            finalValue = 0;
            lastPortions[currentIndex] = totalUnlocked;
        } else {
            finalValue = toValue;
        }
    }
}
