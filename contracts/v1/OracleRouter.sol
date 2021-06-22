//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IBalanceKeeper.sol";
import "../interfaces/ILPKeeper.sol";
import "../interfaces/IOracleRouter.sol";

/// @title OracleRouter
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OracleRouter is IOracleRouter {
    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IBalanceKeeper public balanceKeeper;
    ILPKeeper public lpKeeper;
    bytes32 public gtonAddTopic;
    bytes32 public gtonSubTopic;
    bytes32 public lpAddTopic;
    bytes32 public lpSubTopic;

    mapping(address => bool) public canRoute;

    event SetCanRoute(
        address indexed owner,
        address indexed parser,
        bool indexed newBool
    );
    event GTONAdd(
        bytes16 uuid,
        string chain,
        address emiter,
        address token,
        address sender,
        address receiver,
        uint256 amount
    );
    event GTONSub(
        bytes16 uuid,
        string chain,
        address emiter,
        address token,
        address sender,
        address receiver,
        uint256 amount
    );
    event LPAdd(
        bytes16 uuid,
        string chain,
        address emiter,
        address token,
        address sender,
        address receiver,
        uint256 amount
    );
    event LPSub(
        bytes16 uuid,
        string chain,
        address emiter,
        address token,
        address sender,
        address receiver,
        uint256 amount
    );
    event SetOwner(address ownerOld, address ownerNew);

    constructor(
        IBalanceKeeper _balanceKeeper,
        ILPKeeper _lpKeeper,
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

    function setGTONAddTopic(bytes32 newTopic) public isOwner {
        gtonAddTopic = newTopic;
    }

    function setGTONSubTopic(bytes32 newTopic) public isOwner {
        gtonSubTopic = newTopic;
    }

    function setLPAddTopic(bytes32 newTopic) public isOwner {
        lpAddTopic = newTopic;
    }

    function setLPSubTopic(bytes32 newTopic) public isOwner {
        lpSubTopic = newTopic;
    }

    // permit/forbid a parser to send data to router
    function setCanRoute(address parser, bool _canRoute) public isOwner {
        canRoute[parser] = _canRoute;
        emit SetCanRoute(msg.sender, parser, canRoute[parser]);
    }

    function equal(bytes32 a, bytes32 b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function routeValue(
        bytes16 uuid,
        string calldata chain,
        address emiter,
        bytes32 topic0,
        address token,
        address sender,
        address receiver,
        uint256 amount
    ) external override {
        require(canRoute[msg.sender], "not allowed to route value");

        if (equal(topic0, gtonAddTopic)) {
            balanceKeeper.add(receiver, amount);
            emit GTONAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (equal(topic0, gtonSubTopic)) {
            balanceKeeper.subtract(sender, amount);
            emit GTONSub(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (equal(topic0, lpAddTopic)) {
            lpKeeper.add(token, receiver, amount);
            emit LPAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (equal(topic0, lpSubTopic)) {
            lpKeeper.subtract(token, sender, amount);
            emit LPSub(uuid, chain, emiter, token, sender, receiver, amount);
        }
    }
}
