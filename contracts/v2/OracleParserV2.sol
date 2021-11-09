//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IOracleParserV2.sol";

/// @title OracleParserV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OracleParserV2 is IOracleParserV2 {
    /// @inheritdoc IOracleParserV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IOracleParserV2
    address public override nebula;

    modifier isNebula() {
        require(msg.sender == nebula, "ACN");
        _;
    }

    /// @inheritdoc IOracleParserV2
    IOracleRouterV2 public override router;

    /// @inheritdoc IOracleParserV2
    mapping(bytes16 => bool) public override uuidIsProcessed;

    /// @inheritdoc IOracleParserV2
    mapping(string => bool) public override isEVM;

    constructor(
        address _nebula,
        string[] memory evmChains
    ) {
        owner = msg.sender;
        nebula = _nebula;
        for (uint256 i = 0; i < evmChains.length; i++) {
            isEVM[evmChains[i]] = true;
        }
    }

    /// @inheritdoc IOracleParserV2
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IOracleParserV2
    function setNebula(address _nebula) external override isOwner {
        address nebulaOld = nebula;
        nebula = _nebula;
        emit SetNebula(nebulaOld, _nebula);
    }

    /// @inheritdoc IOracleParserV2
    function setRouter(IOracleRouterV2 _router)
        external
        override
        isOwner
    {
        IOracleRouterV2 routerOld = router;
        router = _router;
        emit SetRouter(routerOld, _router);
    }

    /// @inheritdoc IOracleParserV2
    function setIsEVM(string calldata chain, bool newBool)
        external
        override
        isOwner
    {
        isEVM[chain] = newBool;
        emit SetIsEVM(chain, newBool);
    }

    /// @inheritdoc IOracleParserV2
    function deserializeUint(
        bytes memory b,
        uint256 startPos,
        uint256 len
    ) public pure override returns (uint256) {
        uint256 v = 0;
        for (uint256 p = startPos; p < startPos + len; p++) {
            v = v * 256 + uint256(uint8(b[p]));
        }
        return v;
    }

    /// @inheritdoc IOracleParserV2
    function deserializeAddress(bytes memory b, uint256 startPos)
        public
        pure
        override
        returns (address)
    {
        return address(uint160(deserializeUint(b, startPos, 20)));
    }

    /// @inheritdoc IOracleParserV2
    function bytesToBytes32(bytes memory b, uint256 offset)
        public
        pure
        override
        returns (bytes32)
    {
        bytes32 out;
        for (uint256 i = 0; i < 32; i++) {
            out |= bytes32(b[offset + i]) >> (i * 8);
        }
        return out;
    }

    /// @inheritdoc IOracleParserV2
    function bytesToBytes16(bytes memory b, uint256 offset)
        public
        pure
        override
        returns (bytes16)
    {
        bytes16 out;
        for (uint256 i = 0; i < 16; i++) {
            out |= bytes16(b[offset + i]) >> (i * 8);
        }
        return out;
    }

    /// @inheritdoc IOracleParserV2
    function equal(string memory a, string memory b)
        public
        pure
        override
        returns (bool)
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    /// @inheritdoc IOracleParserV2
    function attachValue(bytes calldata impactData) external override isNebula {
        // @dev ignore data with unexpected length
        if (impactData.length != 200) {
            return;
        }
        bytes16 uuid = bytesToBytes16(impactData, 0); // [  0: 16]
        // @dev parse data only once
        if (uuidIsProcessed[uuid]) {
            return;
        }
        uuidIsProcessed[uuid] = true;
        string memory chain = string(abi.encodePacked(impactData[16:19])); // [ 16: 19]
        if (isEVM[chain]) {
            bytes memory emiter = impactData[19:39]; // [ 19: 39]
            bytes1 topics = bytes1(impactData[39]); // [ 39: 40]
            // @dev ignore data with unexpected number of topics
            if (
                keccak256(abi.encodePacked(topics)) !=
                keccak256(
                    abi.encodePacked(bytes1(abi.encodePacked(uint256(4))[31]))
                )
            ) {
                return;
            }
            bytes32 topic0 = bytesToBytes32(impactData, 40); // [ 40: 72]
            bytes memory token = impactData[84:104]; // [ 72:104][12:32]
            bytes memory sender = impactData[116:136]; // [104:136][12:32]
            bytes memory receiver = impactData[148:168]; // [136:168][12:32]
            uint256 amount = deserializeUint(impactData, 168, 32); // [168:200]

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
}
