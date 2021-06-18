//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IOracleRouterV2.sol";

/// @title OracleRouterV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OracleRouterV2 is IOracleRouterV2 {
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IBalanceKeeperV2 public override balanceKeeper;
    ILPKeeperV2 public override lpKeeper;
    bytes32 public override gtonAddTopic;
    bytes32 public override gtonSubTopic;
    bytes32 public override lpAddTopic;
    bytes32 public override lpSubTopic;

    mapping(address => bool) public override canRoute;

    event SetCanRoute(
        address indexed owner,
        address indexed parser,
        bool indexed newBool
    );
    event GTONAdd(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes token,
        bytes sender,
        bytes receiver,
        uint256 amount
    );
    event GTONSub(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes token,
        bytes sender,
        bytes receiver,
        uint256 amount
    );
    event LPAdd(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes token,
        bytes sender,
        bytes receiver,
        uint256 amount
    );
    event LPSub(
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes token,
        bytes sender,
        bytes receiver,
        uint256 amount
    );
    event SetOwner(address ownerOld, address ownerNew);

    constructor(
        address _owner,
        IBalanceKeeperV2 _balanceKeeper,
        ILPKeeperV2 _lpKeeper,
        bytes32 _gtonAddTopic,
        bytes32 _gtonSubTopic,
        bytes32 _lpAddTopic,
        bytes32 _lpSubTopic
    ) {
        owner = _owner;
        balanceKeeper = _balanceKeeper;
        lpKeeper = _lpKeeper;
        gtonAddTopic = _gtonAddTopic;
        gtonSubTopic = _gtonSubTopic;
        lpAddTopic = _lpAddTopic;
        lpSubTopic = _lpSubTopic;
    }

    function setGTONAddTopic(bytes32 _gtonAddTopic) external override isOwner {
        gtonAddTopic = _gtonAddTopic;
    }

    function setGTONSubTopic(bytes32 _gtonSubTopic) external override isOwner {
        gtonSubTopic = _gtonSubTopic;
    }

    function setLPAddTopic(bytes32 _lpAddTopic) external override isOwner {
        lpAddTopic = _lpAddTopic;
    }

    function setLPSubTopic(bytes32 _lpSubTopic) external override isOwner {
        lpSubTopic = _lpSubTopic;
    }

    // permit/forbid a parser to send data to router
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
        require(canRoute[msg.sender], "not allowed to route value");

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
    }
}
