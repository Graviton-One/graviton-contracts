//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IBalanceKeeperV2.sol";
import "./interfaces/ILPKeeperV2.sol";
import "./interfaces/IOracleRouterV2.sol";

/// @title OracleRouterV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OracleRouterV2 is IOracleRouterV2 {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IBalanceKeeperV2 public balanceKeeper;
    ILPKeeperV2 public lpKeeper;
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
                  bytes emiter,
                  bytes token,
                  bytes sender,
                  bytes receiver,
                  uint256 amount);
    event GTONSub(bytes16 uuid,
                  string chain,
                  bytes emiter,
                  bytes token,
                  bytes sender,
                  bytes receiver,
                  uint256 amount);
    event __LPAdd(bytes16 uuid,
                  string chain,
                  bytes emiter,
                  bytes token,
                  bytes sender,
                  bytes receiver,
                  uint256 amount);
    event __LPSub(bytes16 uuid,
                  string chain,
                  bytes emiter,
                  bytes token,
                  bytes sender,
                  bytes receiver,
                  uint256 amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner,
                IBalanceKeeperV2 _balanceKeeper,
                ILPKeeperV2 _lpKeeper,
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
                        bytes memory emiter,
                        bytes32 topic0,
                        bytes memory token,
                        bytes memory sender,
                        bytes memory receiver,
                        uint256 amount) external override {
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
        if (equal(topic0, __lpAddTopic)) {
            if (!balanceKeeper.isKnownUser(chain, receiver)) {
                balanceKeeper.open(chain, receiver);
            }
            if (!lpKeeper.isKnownToken(chain, token)) {
                lpKeeper.open(chain, token);
            }
            lpKeeper.add(chain, token, chain, receiver, amount);
            emit __LPAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (equal(topic0, __lpSubTopic)) {
            lpKeeper.subtract(chain, token, chain, sender, amount);
            emit __LPSub(uuid, chain, emiter, token, sender, receiver, amount);
        }
    }
}
