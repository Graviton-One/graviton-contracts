//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceGTON {
    function addValue(address user, uint value) external;
    function userBalance(address user) external returns (uint);
    function userAddresses(uint id) external returns (address);
    function subtractValue(address user, uint value) external;
    function users() external returns (uint);
    function impact() external returns (uint);
}

interface IBalanceLP {
    function addTokens(address lptoken, address user, uint value) external;
    function subtractTokens(address lptoken, address user, uint value) external;
}

/// @title OracleRouter
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OracleRouter {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IBalanceGTON public balanceGTON;
    IBalanceLP public balanceLP;
    bytes32 public gtonAddTopic;
    bytes32 public gtonSubTopic;
    bytes32 public lp__AddTopic;
    bytes32 public lp__SubTopic;

    mapping (address=>bool) public allowedParsers;

    event ToggleParser(address indexed owner,
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

    constructor(address _owner,
                IBalanceGTON _balanceGTON,
                IBalanceLP _balanceLP,
                bytes32 _gtonAddTopic,
                bytes32 _gtonSubTopic,
                bytes32 _lp__AddTopic,
                bytes32 _lp__SubTopic
                ) {
        owner = _owner;
        balanceGTON = _balanceGTON;
        balanceLP = _balanceLP;
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
    function toggleParser(address parser) public isOwner {
        allowedParsers[parser] = !allowedParsers[parser];
        emit ToggleParser(msg.sender, parser, allowedParsers[parser]);
    }

    // add access control
    function routeValue(bytes16 uuid,
                        string memory chain,
                        address emiter,
                        bytes32 topic0,
                        address token,
                        address sender,
                        address receiver,
                        uint256 amount) external {
        require(allowedParsers[msg.sender],"not allowed to route value");

        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(gtonAddTopic))) {
            balanceGTON.addValue(receiver, amount);
            emit GTONAdd(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(gtonSubTopic))) {
            balanceGTON.subtractValue(sender, amount);
            emit GTONSub(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(lp__AddTopic))) {
            balanceLP.addTokens(token, receiver, amount);
            emit LP__Add(uuid, chain, emiter, token, sender, receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(lp__SubTopic))) {
            balanceLP.subtractTokens(token, sender, amount);
            emit LP__Sub(uuid, chain, emiter, token, sender, receiver, amount);
        }
    }
}
