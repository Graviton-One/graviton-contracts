//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IOracleRouter.sol";

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

    mapping(bytes16 => bool) public uuidIsProcessed;

    event AttachValue(
        address nebula,
        bytes16 uuid,
        string chain,
        address emiter,
        bytes32 topic0,
        address token,
        address sender,
        address receiver,
        uint256 amount
    );
    event SetOwner(address ownerOld, address ownerNew);
    event SetNebula(address nebulaOld, address nebulaNew);

    constructor(
        IOracleRouter _oracleRouter,
        address _nebula
    ) {
        owner = msg.sender;
        oracleRouter = _oracleRouter;
        nebula = _nebula;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setNebula(address _nebula) public isOwner {
        address nebulaOld = nebula;
        nebula = _nebula;
        emit SetNebula(nebulaOld, _nebula);
    }

    function setOracleRouter(IOracleRouter _oracleRouter) public isOwner {
        oracleRouter = _oracleRouter;
    }

    function deserializeUint(
        bytes memory b,
        uint256 startPos,
        uint256 len
    ) public pure returns (uint256) {
        uint256 v = 0;
        for (uint256 p = startPos; p < startPos + len; p++) {
            v = v * 256 + uint256(uint8(b[p]));
        }
        return v;
    }

    function deserializeAddress(bytes memory b, uint256 startPos)
        public
        pure
        returns (address)
    {
        return address(uint160(deserializeUint(b, startPos, 20)));
    }

    function bytesToBytes32(bytes memory b, uint256 offset)
        public
        pure
        returns (bytes32)
    {
        bytes32 out;
        for (uint256 i = 0; i < 32; i++) {
            out |= bytes32(b[offset + i]) >> (i * 8);
        }
        return out;
    }

    function bytesToBytes16(bytes memory b, uint256 offset)
        public
        pure
        returns (bytes16)
    {
        bytes16 out;
        for (uint256 i = 0; i < 16; i++) {
            out |= bytes16(b[offset + i]) >> (i * 8);
        }
        return out;
    }

    function attachValue(bytes calldata impactData) external isNebula {
        if (impactData.length != 200) {
            return;
        } // ignore data with unexpected length

        bytes16 uuid = bytesToBytes16(impactData, 0); // [  0: 16]
        if (uuidIsProcessed[uuid]) {
            return;
        } // parse data only once
        uuidIsProcessed[uuid] = true;
        string memory chain = string(abi.encodePacked(impactData[16:19])); // [ 16: 19]
        address emiter = deserializeAddress(impactData, 19); // [ 19: 39]
        bytes1 topics = bytes1(impactData[39]); // [ 39: 40]
        if (
            keccak256(abi.encodePacked(topics)) != // ignore data with unexpected number of topics
            keccak256(
                abi.encodePacked(bytes1(abi.encodePacked(uint256(4))[31]))
            )
        ) {
            return;
        }
        bytes32 topic0 = bytesToBytes32(impactData, 40); // [ 40: 72]
        address token = deserializeAddress(impactData[72:], 12); // [ 72:104][12:32]
        address sender = deserializeAddress(impactData[104:], 12); // [104:136][12:32]
        address receiver = deserializeAddress(impactData[136:], 12); // [136:168][12:32]
        uint256 amount = deserializeUint(impactData, 168, 32); // [168:200]

        oracleRouter.routeValue(
            uuid,
            chain,
            emiter,
            topic0,
            token,
            sender,
            receiver,
            amount
        );

        emit AttachValue(
            msg.sender,
            uuid,
            chain,
            emiter,
            topic0,
            token,
            sender,
            receiver,
            amount
        );
    }
}
