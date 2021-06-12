// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import '../ImpactKeeper.sol';

contract ImpactKeeperTest is ImpactKeeper {

    constructor(address _owner, address _nebula, address[] memory _allowedTokens)
        ImpactKeeper(_owner, _nebula, _allowedTokens) {}

    function attachValue(bytes calldata impactData) external override isNebula {}
}
