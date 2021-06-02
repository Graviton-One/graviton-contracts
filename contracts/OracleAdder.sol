//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceKeeper {
    function addValue(address user, uint value) external;
    function userBalance(address user) external returns (uint);
    function subtractValue(address user, uint value) external;
}

/// @title OracleAdder
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OracleAdder {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    address public nebula;

    // nebula control functions
    modifier isNebula() {
        require(msg.sender == nebula, "Caller is not nebula");
        _;
    }

    IBalanceKeeper public balanceContract;

    event AttachValueEvent(address indexed oracleAddress, address indexed senderAddress, address indexed receiverAddress, uint amount);

    constructor(address _owner, IBalanceKeeper _balance, address _nebula) {
        owner = _owner;
        balanceContract = _balance;
        nebula = _nebula;
    }

    function setBalanceContract(IBalanceKeeper newBalanceContract) public isOwner {
        balanceContract = newBalanceContract;
    }

    function setNebula(address newNebulaAddress) public isOwner {
        nebula = newNebulaAddress;
    }

    function deserializeUint(bytes memory b, uint startPos, uint len) internal pure returns (uint) {
        uint v = 0;
        for (uint p = startPos; p < startPos + len; p++) {
            v = v * 256 + uint(uint8(b[p]));
        }
        return v;
    }

    function deserializeAddress(bytes memory b, uint startPos) internal view returns (address) {
        return address(uint160(deserializeUint(b, startPos, 20)));
    }

    // called from gravity to add impact to users
    function attachValue(bytes calldata impactData) external isNebula {
        address senderAddress = deserializeAddress(impactData, 0);
        address receiverAddress = deserializeAddress(impactData, 20);
        uint amount = deserializeUint(impactData, 40, 32);

        balanceContract.addValue(receiverAddress, amount);

        emit AttachValueEvent(msg.sender, senderAddress, receiverAddress, amount);
    }
}
