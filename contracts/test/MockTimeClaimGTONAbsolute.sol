// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../v2/ClaimGTONAbsolute.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IBalanceKeeperV2.sol";
import "../interfaces/IVoterV2.sol";

// used for testing time dependent behavior
contract MockTimeClaimGTONAbsolute is ClaimGTONAbsolute {
    constructor(
        IERC20 _governanceToken,
        address _wallet,
        IBalanceKeeperV2 _balanceKeeper,
        IVoterV2 _voter,
        uint256 _limitAbsolute,
        uint256 _period
    ) ClaimGTONAbsolute(_governanceToken, _wallet, _balanceKeeper, _voter, _limitAbsolute, _period) {}

    // Monday, October 5, 2020 9:00:00 AM GMT-05:00
    uint256 public time = 1601906400;

    function advanceTime(uint256 by) external {
        time += by;
    }

    function _blockTimestamp() internal view override returns (uint256) {
        return time;
    }
}
