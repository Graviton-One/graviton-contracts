//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ISharesLP.sol";

/// @title SharesLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract SharesLP is ISharesLP {
    IBalanceKeeperV2 public override balanceKeeper;
    ILPKeeperV2 public override lpKeeper;
    uint256 public override tokenId;

    constructor(
        IBalanceKeeperV2 _balanceKeeper,
        ILPKeeperV2 _lpKeeper,
        uint256 _tokenId
    ) {
        balanceKeeper = _balanceKeeper;
        lpKeeper = _lpKeeper;
        require(lpKeeper.isKnownToken(_tokenId), "token is not known");
        tokenId = _tokenId;
    }

    function shareById(uint256 userId)
        external
        view
        override
        returns (uint256)
    {
        return lpKeeper.balance(tokenId, userId);
    }

    function totalShares() external view override returns (uint256) {
        return lpKeeper.totalBalance(tokenId);
    }
}
