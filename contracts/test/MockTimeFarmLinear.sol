// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../FarmLinear.sol";

// used for testing time dependent behavior
contract MockTimeFarmLinear is FarmLinear {
    constructor(
        uint256 _amount,
        uint256 _period,
        uint256 _startTimestamp
    ) FarmLinear(_amount, _period, _startTimestamp) {}

    // Monday, October 5, 2020 9:00:00 AM GMT-05:00
    uint256 public time = 1601906400;

    function advanceTime(uint256 by) external {
        time += by;
    }

    function _blockTimestamp() internal view override returns (uint256) {
        return time;
    }
}
