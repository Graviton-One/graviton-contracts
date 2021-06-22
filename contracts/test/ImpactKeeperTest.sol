// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../v1/ImpactKeeper.sol";

contract ImpactKeeperTest is ImpactKeeper {
    constructor(
        address _owner,
        address _nebula,
        address[] memory allowedTokens
    ) ImpactKeeper(_owner, _nebula, allowedTokens) {}

    function attachValue(bytes calldata impactData)
        external
        override
        isNebula
    {}
}
