//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/ILPKeeper.sol';
import './interfaces/IOracleRouter.sol';

/// @title OracleRouterV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OracleRouterV2 is IOracleRouter {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IBalanceKeeperV2 public balanceKeeper;
    ILPKeeper public lpKeeper;
    bytes32 public gtonAddTopic;
    bytes32 public gtonSubTopic;
    bytes32 public __lpAddTopic;
    bytes32 public __lpSubTopic;

    mapping (address=>bool) public canRoute;

    event SetCanRoute(address indexed owner,
                      address indexed parser,
                      bool indexed newBool);
    event GTONAdd(bytes16 uuid,
                  string chain,
                  address emiter,
                  address token,
                  address sender,
                  address receiver,
                  uint256 amount);
    event GTONSub(bytes16 uuid,
                  string chain,
                  address emiter,
                  address token,
                  address sender,
                  address receiver,
                  uint256 amount);
    event __LPAdd(bytes16 uuid,
                  string chain,
                  address emiter,
                  address token,
                  address sender,
                  address receiver,
                  uint256 amount);
    event __LPSub(bytes16 uuid,
                  string chain,
                  address emiter,
                  address token,
                  address sender,
                  address receiver,
                  uint256 amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner,
                IBalanceKeeperV2 _balanceKeeper,
                ILPKeeper _lpKeeper,
                bytes32 _gtonAddTopic,
                bytes32 _gtonSubTopic,
                bytes32 ___lpAddTopic,
                bytes32 ___lpSubTopic
                ) {
        owner = _owner;
        balanceKeeper = _balanceKeeper;
        lpKeeper = _lpKeeper;
        gtonAddTopic = _gtonAddTopic;
        gtonSubTopic = _gtonSubTopic;
        __lpAddTopic = ___lpAddTopic;
        __lpSubTopic = ___lpSubTopic;
    }

    function setGTONAddTopic(bytes32 newTopic) public isOwner {
        gtonAddTopic = newTopic;
    }
    function setGTONSubTopic(bytes32 newTopic) public isOwner {
        gtonSubTopic = newTopic;
    }
    function __setLPAddTopic(bytes32 newTopic) public isOwner {
        __lpAddTopic = newTopic;
    }
    function __setLPSubTopic(bytes32 newTopic) public isOwner {
        __lpSubTopic = newTopic;
    }

    // permit/forbid a parser to send data to router
    function setCanRoute(address parser, bool _canRoute) public isOwner {
        canRoute[parser] = _canRoute;
        emit SetCanRoute(msg.sender, parser, canRoute[parser]);
    }

    function equal(bytes32 a, bytes32 b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function routeValue(bytes16 uuid,
                        string memory chain,
                        address emiter,
                        bytes32 topic0,
                        address token,
                        address sender,
                        address receiver,
                        uint256 amount) external override {
        require(canRoute[msg.sender], "not allowed to route value");

        if (equal(topic0, gtonAddTopic)) {
            bytes memory addr = abi.encodePacked(receiver);
            if (!balanceKeeper.isKnownUser(chain, addr)) {
                balanceKeeper.open(chain, addr);
            }
            balanceKeeper.add(chain, addr, amount);
            emit GTONAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (equal(topic0, gtonSubTopic)) {
            bytes memory addr = abi.encodePacked(sender);
            balanceKeeper.subtract(chain, addr, amount);
            emit GTONSub(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (equal(topic0, __lpAddTopic)) {
            lpKeeper.add(token, receiver, amount);
            emit __LPAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (equal(topic0, __lpSubTopic)) {
            lpKeeper.subtract(token, sender, amount);
            emit __LPSub(uuid, chain, emiter, token, sender, receiver, amount);
        }
    }
}
