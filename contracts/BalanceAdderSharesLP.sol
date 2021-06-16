//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IBalanceAdderShares.sol';
import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/ILPKeeperV2.sol';

/// @title BalanceAdderSharesLP
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract BalanceAdderSharesLP is IBalanceAdderShares {

    IBalanceKeeperV2 public balanceKeeper;
    ILPKeeperV2 public lpKeeper;
    uint public tokenId;

    constructor(IBalanceKeeperV2 _balanceKeeper, ILPKeeperV2 _lpKeeper, uint _tokenId) {
        require(lpKeeper.isKnownToken(_tokenId), "token is not known");
        balanceKeeper = _balanceKeeper;
        lpKeeper = _lpKeeper;
        tokenId = _tokenId;
    }

    function getShareById(uint userId) public view override returns (uint) {
        return lpKeeper.balance(tokenId, userId);
    }

    function getTotal() public view override returns (uint) {
        return lpKeeper.totalBalance(tokenId);
    }
}
