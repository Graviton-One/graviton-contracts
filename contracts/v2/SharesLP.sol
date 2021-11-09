//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/ISharesLP.sol";

/// @title SharesLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract SharesLP is ISharesLP {
    /// @inheritdoc ISharesLP
    ILPKeeperV2 public override lpKeeper;

    /// @inheritdoc ISharesLP
    uint256 public override tokenId;

    constructor(ILPKeeperV2 _lpKeeper, uint256 _tokenId) {
        lpKeeper = _lpKeeper;
        require(lpKeeper.isKnownToken(_tokenId), "SL1");
        tokenId = _tokenId;
    }

    /// @inheritdoc IShares
    function shareById(uint256 userId)
        external
        view
        override
        returns (uint256)
    {
        return lpKeeper.balance(tokenId, userId);
    }

    /// @inheritdoc IShares
    function totalShares() external view override returns (uint256) {
        return lpKeeper.totalBalance(tokenId);
    }

    /// @inheritdoc IShares
    function totalUsers() external view override returns (uint256) {
        return lpKeeper.totalTokenUsers(tokenId);
    }

    /// @inheritdoc IShares
    function userIdByIndex(uint256 index)
        external
        view
        override
        returns (uint256)
    {
        return lpKeeper.tokenUser(tokenId, index);
    }
}
