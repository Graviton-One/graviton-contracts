//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IOracleRouterV2.sol";

/// @title OracleRouterV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OracleRouterV2 is IOracleRouterV2 {

    /// @inheritdoc IOracleRouterV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IOracleRouterV2
    IBalanceKeeperV2 public override balanceKeeper;
    /// @inheritdoc IOracleRouterV2
    ILPKeeperV2 public override lpKeeper;
    /// @inheritdoc IOracleRouterV2
    bytes32 public override gtonAddTopic;
    /// @inheritdoc IOracleRouterV2
    bytes32 public override gtonSubTopic;
    /// @inheritdoc IOracleRouterV2
    bytes32 public override lpAddTopic;
    /// @inheritdoc IOracleRouterV2
    bytes32 public override lpSubTopic;

    /// @inheritdoc IOracleRouterV2
    mapping(address => bool) public override canRoute;

    constructor(
        IBalanceKeeperV2 _balanceKeeper,
        ILPKeeperV2 _lpKeeper,
        bytes32 _gtonAddTopic,
        bytes32 _gtonSubTopic,
        bytes32 _lpAddTopic,
        bytes32 _lpSubTopic
    ) {
        owner = msg.sender;
        balanceKeeper = _balanceKeeper;
        lpKeeper = _lpKeeper;
        gtonAddTopic = _gtonAddTopic;
        gtonSubTopic = _gtonSubTopic;
        lpAddTopic = _lpAddTopic;
        lpSubTopic = _lpSubTopic;
    }

    /// @inheritdoc IOracleRouterV2
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IOracleRouterV2
    function setGTONAddTopic(bytes32 _gtonAddTopic) external override isOwner {
        bytes32 topicOld = gtonAddTopic;
        gtonAddTopic = _gtonAddTopic;
        emit SetGTONAddTopic(topicOld, _gtonAddTopic);
    }

    /// @inheritdoc IOracleRouterV2
    function setGTONSubTopic(bytes32 _gtonSubTopic) external override isOwner {
        bytes32 topicOld = gtonSubTopic;
        gtonSubTopic = _gtonSubTopic;
        emit SetGTONSubTopic(topicOld, _gtonSubTopic);
    }

    /// @inheritdoc IOracleRouterV2
    function setLPAddTopic(bytes32 _lpAddTopic) external override isOwner {
        bytes32 topicOld = lpAddTopic;
        lpAddTopic = _lpAddTopic;
        emit SetLPAddTopic(topicOld, _lpAddTopic);
    }

    /// @inheritdoc IOracleRouterV2
    function setLPSubTopic(bytes32 _lpSubTopic) external override isOwner {
        bytes32 topicOld = lpSubTopic;
        lpSubTopic = _lpSubTopic;
        emit SetLPSubTopic(topicOld, _lpSubTopic);
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

    function equal(bytes32 a, bytes32 b) internal pure returns (bool) {
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

        if (equal(topic0, gtonAddTopic)) {
            if (!balanceKeeper.isKnownUser(chain, receiver)) {
                balanceKeeper.open(chain, receiver);
            }
            balanceKeeper.add(chain, receiver, amount);
            emit GTONAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (equal(topic0, gtonSubTopic)) {
            balanceKeeper.subtract(chain, sender, amount);
            emit GTONSub(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (equal(topic0, lpAddTopic)) {
            if (!balanceKeeper.isKnownUser(chain, receiver)) {
                balanceKeeper.open(chain, receiver);
            }
            if (!lpKeeper.isKnownToken(chain, token)) {
                lpKeeper.open(chain, token);
            }
            lpKeeper.add(chain, token, chain, receiver, amount);
            emit LPAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (equal(topic0, lpSubTopic)) {
            lpKeeper.subtract(chain, token, chain, sender, amount);
            emit LPSub(uuid, chain, emiter, token, sender, receiver, amount);
        }

        emit RouteValue(uuid, chain, emiter, token, sender, receiver, amount);
    }
}
