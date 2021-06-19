//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ISharesEB.sol";

/// @title SharesEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract SharesEB is ISharesEB {

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

    constructor(IBalanceKeeperV2 _balanceKeeper, IImpactKeeper _impactEB) {
        balanceKeeper = _balanceKeeper;
        impactEB = _impactEB;
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
            emit Migrate(user, userId, impactById[userId]);
        }
        // @dev moved here from the constructor to test different impactEB states
        totalSupply = impactEB.totalSupply();
        currentUser = toUser;
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
}
