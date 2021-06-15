//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IBalanceKeeper.sol';
import './interfaces/IBalanceKeeperLP.sol';
import './interfaces/IOracleRouter.sol';

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
    IBalanceKeeperLP public balanceKeeperLP;
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
                IBalanceKeeper _balanceKeeper,
                IBalanceKeeperLP _balanceKeeperLP,
                bytes32 _gtonAddTopic,
                bytes32 _gtonSubTopic,
                bytes32 ___lpAddTopic,
                bytes32 ___lpSubTopic
                ) {
        owner = _owner;
        balanceKeeper = _balanceKeeper;
        balanceKeeperLP = _balanceKeeperLP;
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

    function routeValue(bytes16 uuid,
                        string memory chain,
                        address emiter,
                        bytes32 topic0,
                        address token,
                        address sender,
                        address receiver,
                        uint256 amount) external override {
        require(canRoute[msg.sender], "not allowed to route value");

        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(gtonAddTopic))) {
            balanceKeeper.add(receiver, amount);
            emit GTONAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(gtonSubTopic))) {
            balanceKeeper.subtract(sender, amount);
            emit GTONSub(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(__lpAddTopic))) {
            balanceKeeperLP.add(token, receiver, amount);
            emit __LPAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(__lpSubTopic))) {
            balanceKeeperLP.subtract(token, sender, amount);
            emit __LPSub(uuid, chain, emiter, token, sender, receiver, amount);
        }
    }
}
