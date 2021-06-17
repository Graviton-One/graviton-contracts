//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IShares.sol';
import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/ILPKeeperV2.sol';

/// @title SharesLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract SharesLP is IShares {

    IBalanceKeeperV2 public balanceKeeper;
    ILPKeeperV2 public lpKeeper;
    uint public tokenId;

    constructor(IBalanceKeeperV2 _balanceKeeper, ILPKeeperV2 _lpKeeper, uint _tokenId) {
        balanceKeeper = _balanceKeeper;
        lpKeeper = _lpKeeper;
        require(lpKeeper.isKnownToken(_tokenId), "token is not known");
        tokenId = _tokenId;
    }

    function shareById(uint userId) public view override returns (uint) {
        return lpKeeper.balance(tokenId, userId);
    }

    function totalShares() public view override returns (uint) {
        return lpKeeper.totalBalance(tokenId);
    }
}
