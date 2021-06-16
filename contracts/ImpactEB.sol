//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./ImpactKeeper.sol";

/// @title ImpactEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract ImpactEB is ImpactKeeper {

    bool public canWithdraw = false;
    bool public canAttach = true;

    constructor(address _owner, address _nebula, address[] memory _allowedTokens)
        ImpactKeeper(_owner, _nebula, _allowedTokens) {}

    function setCanWithdraw(bool _canWithdraw) public isOwner {
        canWithdraw = _canWithdraw;
    }

    function setCanAttach(bool _canAttach) public isOwner {
        canAttach = _canAttach;
    }

    // called from gravity to add impact to users
    function attachValue(bytes calldata impactData) external override isNebula {
        if (!canAttach) { return; } // do nothing if attach is no longer allowed (early birds is over)
        address lockTokenAddress = this.deserializeAddress(impactData, 0);
        address depositerAddress = this.deserializeAddress(impactData, 20);
        uint amount = this.deserializeUint(impactData, 40, 32);
        uint id = this.deserializeUint(impactData, 72, 32);
        uint action = this.deserializeUint(impactData, 104, 32);
        if (dataId[id] == true) { return; } // do nothing if data has already been processed
        dataId[id] = true;
        emit Transfer(lockTokenAddress, depositerAddress, amount, id, action);

        if (!tokenIsAllowed[lockTokenAddress]) { return; } // do nothing if this token is not supported by treasury
        if (impact[depositerAddress] == 0) {
            users[totalUsers] = depositerAddress;
            totalUsers += 1;
        }
        impact[depositerAddress] += amount;
        totalSupply += amount;
    }
}
