//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IDeliveryRouter.sol";

/// @title DeliveryRouter
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract DeliveryRouter is IDeliveryRouter {
    /// @inheritdoc IOracleRouterV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IDeliveryRouter
    bytes32 public override confirmClaimTopic;
    /// @inheritdoc IDeliveryRouter
    address public override wallet;
    /// @inheritdoc IDeliveryRouter
    IERC20 public override governanceToken;

    /// @inheritdoc IOracleRouterV2
    mapping(address => bool) public override canRoute;

    constructor(
        address _wallet,
        IERC20 _governanceToken,
        bytes32 _confirmClaimTopic
    ) {
        owner = msg.sender;
        wallet = _wallet;
        governanceToken = _governanceToken;
        confirmClaimTopic = _confirmClaimTopic;
    }

    /// @inheritdoc IOracleRouterV2
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IDeliveryRouter
    function setWallet(address _wallet) public override isOwner {
        address walletOld = wallet;
        wallet = _wallet;
        emit SetWallet(walletOld, _wallet);
    }

    /// @inheritdoc IOracleRouterV2
    function setCanRoute(address parser, bool _canRoute)
        external
        override
        isOwner
    {
        canRoute[parser] = _canRoute;
        emit SetCanRoute(msg.sender, parser, canRoute[parser]);
    }

    /// @inheritdoc IDeliveryRouter
    function setConfirmClaimTopic(bytes32 _confirmClaimTopic) external override isOwner {
        bytes32 topicOld = confirmClaimTopic;
        confirmClaimTopic = _confirmClaimTopic;
        emit SetConfirmClaimTopic(topicOld, _confirmClaimTopic);
    }

    function equal(bytes32 a, bytes32 b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function deserializeUint(
        bytes memory b,
        uint256 startPos,
        uint256 len
    ) internal pure returns (uint256) {
        uint256 v = 0;
        for (uint256 p = startPos; p < startPos + len; p++) {
            v = v * 256 + uint256(uint8(b[p]));
        }
        return v;
    }

    function deserializeAddress(bytes memory b, uint256 startPos)
        internal
        pure
        returns (address)
    {
        return address(uint160(deserializeUint(b, startPos, 20)));
    }

    /// @inheritdoc IOracleRouterV2
    function routeValue(
        bytes16 uuid,
        string memory chain,
        bytes memory emiter,
        bytes32 topic0,
        bytes memory token,
        bytes memory sender,
        bytes memory receiver,
        uint256 amount
    ) external override {
        require(canRoute[msg.sender], "ACR");

        if (equal(topic0, confirmClaimTopic)) {
            address user = deserializeAddress(receiver, 0);
            governanceToken.transferFrom(wallet, user, amount);
            emit DeliverClaim(address(governanceToken), user, user, amount);
        }

        emit RouteValue(uuid, chain, emiter, token, sender, receiver, amount);
    }
}
