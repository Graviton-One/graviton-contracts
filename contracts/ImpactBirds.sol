pragma solidity >=0.8.0;

import "./ImpactAbstract.sol";

contract BirdsImpact is DepositersImpact{

    constructor(address _owner, address _nebula, address[] memory _allowedTokens, address _governanceTokenAddr, address _farmAddr)
        DepositersImpact(_owner,_nebula,_allowedTokens,_governanceTokenAddr,_farmAddr) {
            withdrawAllowance = false;
            attachAllowance = true;
        }

    event withdrawEvent(address user,uint amount);
    bool public withdrawAllowance;
    bool public attachAllowance;

    function toggleWithdraw(bool allowance) public isOwner {
        withdrawAllowance = allowance;
    }

    function toggleAttach(bool allowance) public isOwner {
        attachAllowance = allowance;
    }

    function withdraw(uint amount) public {
        require(withdrawAllowance,"withdraw not allowed");
        require(amount <= impact[msg.sender], "you don't have so much impact");
        impact[msg.sender] -= amount;
        totalSupply -= amount;
        emit withdrawEvent(msg.sender,amount);
    }

    // called from gravity to add impact to users
    function attachValue(bytes calldata impactData) external override isNebula {
        if (!attachAllowance) { return; } // do nothing if attach is no longer allowed (early birds is over)
        address lockTokenAddress = this.deserializeAddress(impactData, 0);
        address depositerAddress = this.deserializeAddress(impactData, 20);
        uint amount = this.deserializeUint(impactData, 40, 32);
        uint id = this.deserializeUint(impactData, 72, 32);
        uint action = this.deserializeUint(impactData, 104, 32);
        if (dataId[id] == true) { return; } // do nothing if data has already been processed
        dataId[id] = true;
        emit Transfer(lockTokenAddress, depositerAddress, amount, id, action);

        if (!allowedTokens[lockTokenAddress]) { return; } // do nothing if this token is not supported by treasury
        if (impact[depositerAddress] == 0) {
            users[userCount] = depositerAddress;
            userCount += 1;
        }
        impact[depositerAddress] += amount;
        totalSupply += amount;
    }
}
