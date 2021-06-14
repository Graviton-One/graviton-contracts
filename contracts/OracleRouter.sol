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
    bytes32 public lp__AddTopic;
    bytes32 public lp__SubTopic;

    mapping (address=>bool) public canParse;

    event SetCanParse(address indexed owner,
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
    event LP__Add(bytes16 uuid,
                  string chain,
                  address emiter,
                  address token,
                  address sender,
                  address receiver,
                  uint256 amount);
    event LP__Sub(bytes16 uuid,
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
                bytes32 _lp__AddTopic,
                bytes32 _lp__SubTopic
                ) {
        owner = _owner;
        balanceKeeper = _balanceKeeper;
        balanceKeeperLP = _balanceKeeperLP;
        gtonAddTopic = _gtonAddTopic;
        gtonSubTopic = _gtonSubTopic;
        lp__AddTopic = _lp__AddTopic;
        lp__SubTopic = _lp__SubTopic;
    }

    function setGTONAddTopic(bytes32 newTopic) public isOwner {
        gtonAddTopic = newTopic;
    }
    function setGTONSubTopic(bytes32 newTopic) public isOwner {
        gtonSubTopic = newTopic;
    }
    function setLP__AddTopic(bytes32 newTopic) public isOwner {
        lp__AddTopic = newTopic;
    }
    function setLP__SubTopic(bytes32 newTopic) public isOwner {
        lp__SubTopic = newTopic;
    }

    // permit/forbid a parser to send data to router
    function setCanParse(address parser, bool _canParse) public isOwner {
        canParse[parser] = _canParse;
        emit SetCanParse(msg.sender, parser, canParse[parser]);
    }

    // add access control
    function routeValue(bytes16 uuid,
                        string memory chain,
                        address emiter,
                        bytes32 topic0,
                        address token,
                        address sender,
                        address receiver,
                        uint256 amount) external override {
        require(canParse[msg.sender], "not allowed to route value");

        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(gtonAddTopic))) {
            balanceKeeper.addValue(receiver, amount);
            emit GTONAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(gtonSubTopic))) {
            balanceKeeper.subtractValue(sender, amount);
            emit GTONSub(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(lp__AddTopic))) {
            balanceKeeperLP.addLPToken(token, receiver, amount);
            emit LP__Add(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(lp__SubTopic))) {
            balanceKeeperLP.subtractLPToken(token, sender, amount);
            emit LP__Sub(uuid, chain, emiter, token, sender, receiver, amount);
        }
    }
}
