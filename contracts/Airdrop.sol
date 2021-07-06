//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IBalanceKeeperV2.sol";

/// @title Airdrop
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract Airdrop {

    IBalanceKeeperV2 public balanceKeeper;

    constructor(IBalanceKeeperV2 _balanceKeeper) {
        balanceKeeper = _balanceKeeper;
    }

    function airdrop(address[] memory users, uint256 amount) external {
        for (uint256 i = 0; i < users.length; i++) {
            balanceKeeper.add("EVM", abi.encodePacked(users[i]), amount);
        }
    }
}
