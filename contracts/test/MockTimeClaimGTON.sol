// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../v1/ClaimGTON.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IBalanceKeeper.sol";
import "../interfaces/IVoter.sol";

// used for testing time dependent behavior
contract MockTimeClaimGTON is ClaimGTON {
    constructor(
        IERC20 _governanceToken,
        address _wallet,
        IBalanceKeeper _balanceKeeper,
        IVoter _voter
    ) ClaimGTON(_governanceToken, _wallet, _balanceKeeper, _voter) {}

    // Monday, October 5, 2020 9:00:00 AM GMT-05:00
    uint256 public time = 1601906400;

    function advanceTime(uint256 by) external {
        time += by;
    }

    function _blockTimestamp() internal view override returns (uint256) {
        return time;
    }
}
