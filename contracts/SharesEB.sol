//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IShares.sol";
import "./interfaces/IBalanceKeeperV2.sol";
import "./interfaces/IImpactKeeper.sol";
import "hardhat/console.sol";

/// @title SharesEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract SharesEB is IShares {

    mapping (uint => uint) impactById;
    uint public totalSupply;
    uint public lastUser;

    IBalanceKeeperV2 public balanceKeeper;
    IImpactKeeper public impactEB;

    constructor(IBalanceKeeperV2 _balanceKeeper, IImpactKeeper _impactEB) {
        balanceKeeper = _balanceKeeper;
        impactEB = _impactEB;
    }

    function migrate(uint step) public {
        uint toUser = lastUser + step;
        if (toUser > balanceKeeper.totalUsers()) {
            toUser = balanceKeeper.totalUsers();
        }
        for (uint i = lastUser; i < toUser; i++) {
            address user = impactEB.users(i);
            bytes memory userAddress = abi.encodePacked(user);
            if (!balanceKeeper.isKnownUser("EVM", userAddress)) {
                balanceKeeper.open("EVM", userAddress);
            }
            uint userId = balanceKeeper.userIdByChainAddress("EVM", userAddress);
            impactById[userId] = impactEB.impact(user);
        }
        // moved here from the constructor to test different impactEB states
        totalSupply = impactEB.totalSupply();
        lastUser = toUser;
    }

    function shareById(uint userId) public view override returns (uint) {
        return impactById[userId];
    }

    function totalShares() public view override returns (uint) {
        return totalSupply;
    }
}
