// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import '../ClaimGTONV2.sol';
import '../interfaces/IERC20.sol';
import '../interfaces/IBalanceKeeperV2.sol';
import '../interfaces/IVoter.sol';

// used for testing time dependent behavior
contract MockTimeClaimGTONV2 is ClaimGTONV2 {

    constructor(address _owner,
                IERC20 _governanceToken,
                address _wallet,
                IBalanceKeeperV2 _balanceKeeper,
                IVoter _voter)
        ClaimGTONV2(_owner,
                    _governanceToken,
                    _wallet,
                    _balanceKeeper,
                    _voter) {}

    // Monday, October 5, 2020 9:00:00 AM GMT-05:00
    uint256 public time = 1601906400;

    function advanceTime(uint256 by) external {
        time += by;
    }

    function _blockTimestamp() internal view override returns (uint) {
        return time;
    }
}
