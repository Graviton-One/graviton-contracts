//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ISharesEB.sol";

/// @title SharesEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract SharesEB is ISharesEB {
    mapping(uint256 => uint256) public override impactById;
    uint256 public override totalSupply;
    uint256 public override lastUser;

    IBalanceKeeperV2 public override balanceKeeper;
    IImpactKeeper public override impactEB;

    constructor(IBalanceKeeperV2 _balanceKeeper, IImpactKeeper _impactEB) {
        balanceKeeper = _balanceKeeper;
        impactEB = _impactEB;
    }

    function migrate(uint256 step) external override {
        uint256 toUser = lastUser + step;
        if (toUser > impactEB.userCount()) {
            toUser = impactEB.userCount();
        }
        for (uint256 i = lastUser; i < toUser; i++) {
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
        }
        // moved here from the constructor to test different impactEB states
        totalSupply = impactEB.totalSupply();
        lastUser = toUser;
    }

    function shareById(uint256 userId)
        external
        view
        override
        returns (uint256)
    {
        return impactById[userId];
    }

    function totalShares() external view override returns (uint256) {
        return totalSupply;
    }
}
