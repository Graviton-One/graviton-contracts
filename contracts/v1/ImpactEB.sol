//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./ImpactKeeper.sol";

/// @title BirdsEB
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract ImpactEB is ImpactKeeper {
    constructor(
        address _owner,
        address _nebula,
        address[] memory _allowedTokens
    ) ImpactKeeper(_owner, _nebula, _allowedTokens) {
        withdrawAllowance = false;
        attachAllowance = true;
    }

    event withdrawEvent(address user, uint256 amount);
    bool public withdrawAllowance;
    bool public attachAllowance;

    function toggleWithdraw(bool allowance) public isOwner {
        withdrawAllowance = allowance;
    }

    function toggleAttach(bool allowance) public isOwner {
        attachAllowance = allowance;
    }

    function withdraw(uint256 amount) public {
        require(withdrawAllowance, "withdraw not allowed");
        require(amount <= impact[msg.sender], "you don't have so much impact");
        impact[msg.sender] -= amount;
        totalSupply -= amount;
        emit withdrawEvent(msg.sender, amount);
    }

    // called from gravity to add impact to users
    function attachValue(bytes calldata impactData) external override isNebula {
        if (!attachAllowance) {
            return;
        } // do nothing if attach is no longer allowed (early birds is over)
        address lockTokenAddress = this.deserializeAddress(impactData, 0);
        address depositerAddress = this.deserializeAddress(impactData, 20);
        uint256 amount = this.deserializeUint(impactData, 40, 32);
        uint256 id = this.deserializeUint(impactData, 72, 32);
        uint256 action = this.deserializeUint(impactData, 104, 32);
        if (dataId[id] == true) {
            return;
        } // do nothing if data has already been processed
        dataId[id] = true;
        emit Transfer(lockTokenAddress, depositerAddress, amount, id, action);

        if (!allowedTokens[lockTokenAddress]) {
            return;
        } // do nothing if this token is not supported by treasury
        if (impact[depositerAddress] == 0) {
            users[userCount] = depositerAddress;
            userCount += 1;
        }
        impact[depositerAddress] += amount;
        totalSupply += amount;
    }
}
