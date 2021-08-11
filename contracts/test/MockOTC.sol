// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../OTC.sol";

// used for testing time dependent behavior
contract MockOTC is OTC {
    constructor(
        IERC20 _base,
        IERC20 _quote,
        uint256 _price,
        uint256 _lowerLimit,
        uint256 _upperLimit,
        uint256 _cliff,
        uint256 _vestingTimeAdmin,
        uint256 _numberOfTranchesAdmin
    ) OTC(
        _base,
        _quote,
        _price,
        _lowerLimit,
        _upperLimit,
        _cliff,
        _vestingTimeAdmin,
        _numberOfTranchesAdmin
    ) {}

    // Monday, October 5, 2020 9:00:00 AM GMT-05:00
    uint256 public time = 1601906400;

    function advanceTime(uint256 by) external {
        time += by;
    }

    function _blockTimestamp() internal view override returns (uint256) {
        return time;
    }
}
