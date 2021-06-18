//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IShares.sol";
import "./interfaces/IBalanceKeeperV2.sol";
import "./interfaces/IImpactKeeper.sol";

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
        totalSupply = impactEB.totalSupply();
        migrate(1);
    }

    function migrate(uint step) internal {
        require(lastUser != 0, "migration is finished");
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
        if (toUser == balanceKeeper.totalUsers()) {
            lastUser = 0;
        } else {
            lastUser = toUser;
        }
    }

    function shareById(uint userId) public view override returns (uint) {
        return impactById[userId];
    }

    function totalShares() public view override returns (uint) {
        return totalSupply;
    }
}
