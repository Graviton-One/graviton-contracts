//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IOracleRouter.sol';

/// @title OracleParser
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OracleParser {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    address public nebula;

    modifier isNebula() {
        require(msg.sender == nebula, "Caller is not nebula");
        _;
    }

    IOracleRouter public oracleRouter;

    mapping (bytes17 => bool) public uuidIsProcessed;

    event AttachValue(address nebula,
                      bytes16 uuid,
                      string chain,
                      address emiter,
                      bytes32 topic0,
                      address token,
                      address sender,
                      address receiver,
                      uint256 amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, IOracleRouter _router, address _nebula) {
        owner = _owner;
        oracleRouter = _router;
        nebula = _nebula;
    }

    function setRouterContract(IOracleRouter newRouterContract) public isOwner {
        oracleRouter = newRouterContract;
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

    function deserializeAddress(bytes memory b, uint startPos) internal pure returns (address) {
        return address(uint160(deserializeUint(b, startPos, 20)));
    }

    function bytesToBytes32(bytes memory b, uint offset) private pure returns (bytes32) {
        bytes32 out;
        for (uint i = 0; i < 32; i++) {
          out |= bytes32(b[offset + i]) >> (i * 8);
        }
        return out;
    }

    function bytesToBytes16(bytes memory b, uint offset) private pure returns (bytes16) {
        bytes16 out;
        for (uint i = 0; i < 16; i++) {
          out |= bytes16(b[offset + i]) >> (i * 8);
        }
        return out;
    }

    function attachValue(bytes calldata impactData) external isNebula {

        if (impactData.length != 200) { return; }  // ignore data with unexpected length

        bytes16 uuid = bytesToBytes16(impactData, 0);                      // [  0: 16]
        // TODO: check if uuid already tested
        if (uuidIsProcessed[uuid]) { return; } // parse data only once
        uuidIsProcessed[uuid] = true;
        string memory chain = string(abi.encodePacked(impactData[16:19])); // [ 16: 19]
        address emiter = deserializeAddress(impactData, 19);               // [ 19: 39]
        bytes1 topics = bytes1(impactData[39]);                            // [ 39: 40]
        if (keccak256(abi.encodePacked(topics)) != // ignore data with unexpected number of topics
            keccak256(abi.encodePacked(bytes1(abi.encodePacked(uint(4))[31])))) {
            return;
        }
        bytes32 topic0 = bytesToBytes32(impactData, 40);                   // [ 40: 72]
        address token = deserializeAddress(impactData[72:], 12);           // [ 72:104][12:32]
        address sender = deserializeAddress(impactData[104:], 12);         // [104:136][12:32]
        address receiver = deserializeAddress(impactData[136:], 12);       // [136:168][12:32]
        uint256 amount = deserializeUint(impactData, 168, 32);             // [168:200]

        oracleRouter.routeValue(uuid,
                                chain,
                                emiter,
                                topic0,
                                token,
                                sender,
                                receiver,
                                amount);

        emit AttachValue(msg.sender,
                              uuid,
                              chain,
                              emiter,
                              topic0,
                              token,
                              sender,
                              receiver,
                              amount);
    }
}
