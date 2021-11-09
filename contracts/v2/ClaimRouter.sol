//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IClaimRouter.sol";

/// @title ClaimRouter
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract ClaimRouter is IClaimRouter {
    /// @inheritdoc IOracleRouterV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IClaimRouter
    IBalanceKeeperV2 public override balanceKeeper;
    /// @inheritdoc IClaimRouter
    bytes32 public override requestClaimTopic;

    /// @inheritdoc IOracleRouterV2
    mapping(address => bool) public override canRoute;

    constructor(
        IBalanceKeeperV2 _balanceKeeper,
        bytes32 _requestClaimTopic
    ) {
        owner = msg.sender;
        balanceKeeper = _balanceKeeper;
        requestClaimTopic = _requestClaimTopic;
    }

    /// @inheritdoc IOracleRouterV2
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
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

    /// @inheritdoc IClaimRouter
    function setRequestClaimTopic(bytes32 _requestClaimTopic) external override isOwner {
        bytes32 topicOld = requestClaimTopic;
        requestClaimTopic = _requestClaimTopic;
        emit SetRequestClaimTopic(topicOld, _requestClaimTopic);
    }

    function equal(bytes32 a, bytes32 b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function equal(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
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

        if (equal(topic0, requestClaimTopic)) {
            if (balanceKeeper.balance(chain, sender) >= amount) {
                balanceKeeper.subtract("EVM", sender, amount);
                if (equal(chain, "ETH")) {
                    emit ClaimETH(token, sender, receiver, amount);
                }
                if (equal(chain, "BSC")) {
                    emit ClaimBSC(token, sender, receiver, amount);
                }
                if (equal(chain, "PLG")) {
                    emit ClaimPLG(token, sender, receiver, amount);
                }
            }
        }

        emit RouteValue(uuid, chain, emiter, token, sender, receiver, amount);
    }
}
