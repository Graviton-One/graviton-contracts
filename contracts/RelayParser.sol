//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IRelayParser.sol";

/// @title RelayParser
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract RelayParser is IRelayParser {
    /// @inheritdoc IRelayParser
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IRelayParser
    address public override nebula;

    modifier isNebula() {
        require(msg.sender == nebula, "ACN");
        _;
    }

    /// @inheritdoc IRelayParser
    IRelay public override router;

    /// @inheritdoc IRelayParser
    mapping(bytes16 => bool) public override uuidIsProcessed;

    /// @inheritdoc IRelayParser
    mapping(string => bool) public override isEVM;

    constructor(
        IRelay _router,
        address _nebula,
        string[] memory evmChains
    ) {
        owner = msg.sender;
        router = _router;
        nebula = _nebula;
        for (uint256 i = 0; i < evmChains.length; i++) {
            isEVM[evmChains[i]] = true;
        }
    }

    /// @inheritdoc IRelayParser
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IRelayParser
    function setNebula(address _nebula) external override isOwner {
        address nebulaOld = nebula;
        nebula = _nebula;
        emit SetNebula(nebulaOld, _nebula);
    }

    /// @inheritdoc IRelayParser
    function setRouter(IRelay _router) external override isOwner {
        IRelay routerOld = router;
        router = _router;
        emit SetRouter(routerOld, _router);
    }

    /// @inheritdoc IRelayParser
    function setIsEVM(string calldata chain, bool newBool)
        external
        override
        isOwner
    {
        isEVM[chain] = newBool;
        emit SetIsEVM(chain, newBool);
    }

    /// @inheritdoc IRelayParser
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

    /// @inheritdoc IRelayParser
    function deserializeAddress(bytes memory b, uint256 startPos)
        public
        pure
        override
        returns (address)
    {
        return address(uint160(deserializeUint(b, startPos, 20)));
    }

    /// @inheritdoc IRelayParser
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

    /// @inheritdoc IRelayParser
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

    /// @inheritdoc IRelayParser
    function equal(string memory a, string memory b)
        public
        pure
        override
        returns (bool)
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    /// @inheritdoc IRelayParser
    function attachValue(bytes calldata data) external override isNebula {
        bytes16 uuid = bytesToBytes16(data, 0); // [  0: 16]
        // @dev parse data only once
        if (uuidIsProcessed[uuid]) {
            return;
        }
        uuidIsProcessed[uuid] = true;
        string memory origin = string(abi.encodePacked(data[16:19])); // [ 16: 19] origin
        if (isEVM[origin]) {
            // bytes memory emiter = data[19:39]; // [ 19: 39]
            // bytes32 topic0 = bytesToBytes32(data, 40); // [ 40: 72] topic0
            // bytes32 topic1 = bytesToBytes32(data, 72); // [ 72: 104 ] destinationHash
            bytes32 topic2 = bytesToBytes32(data, 104); // [104: 136 ] lockHash
            (
                string memory destination,
                bytes memory sender,
                ,
                // uint256 amountLock
                bytes memory receiver,
                uint256 amountRelay
            ) = abi.decode(
                    data[136:],
                    (string, bytes, uint256, bytes, uint256)
                );

            router.unlock(
                topic2,
                origin,
                destination,
                sender,
                amountRelay,
                receiver
            );

            emit AttachValue(data);
        }
    }
}
