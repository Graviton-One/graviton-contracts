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
    bytes32 public balanceGTONAddEventTopic;
    bytes32 public balanceGTONSubtractEventTopic;
    bytes32 public balanceLPAddEventTopic;
    bytes32 public balanceLPSubtractEventTopic;

    event BalanceGTONAddEvent(address receiver, uint amount);
    event BalanceGTONSubtractEvent(address receiver, uint amount);
    event BalanceLPAddEvent(address lptoken, address receiver, uint amount);
    event BalanceLPSubtractEvent(address lptoken, address receiver, uint amount);

    constructor(address _owner,
                IBalanceGTON _balanceGTON,
                IBalanceLP _balanceLP,
                bytes32 _balanceGTONAddEventTopic,
                bytes32 _balanceGTONSubtractEventTopic,
                bytes32 _balanceLPAddEventTopic,
                bytes32 _balanceLPSubtractEventTopic
                ) {
        owner = _owner;
        balanceGTON = _balanceGTON;
        balanceLP = _balanceLP;
        balanceGTONAddEventTopic = _balanceGTONAddEventTopic;
        balanceGTONSubtractEventTopic = _balanceGTONSubtractEventTopic;
        balanceLPAddEventTopic = _balanceLPAddEventTopic;
        balanceLPSubtractEventTopic = _balanceLPSubtractEventTopic;
    }

    function routeValue(bytes16 uuid,
                        string memory chain,
                        address emiter,
                        bytes32 topic0,
                        address topic1,
                        address topic2,
                        uint256 amount) external {
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(balanceGTONAddEventTopic))) {
            address receiver = topic2;
            balanceGTON.addValue(receiver, amount);
            emit BalanceGTONAddEvent(receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(balanceGTONSubtractEventTopic))) {
            address receiver = topic2;
            balanceGTON.subtractValue(receiver, amount);
            emit BalanceGTONSubtractEvent(receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(balanceLPAddEventTopic))) {
            address receiver = topic2;
            address lptoken = topic1;
            balanceLP.addTokens(lptoken, receiver, amount);
            emit BalanceLPAddEvent(lptoken, receiver, amount);
        }
        if (keccak256(abi.encodePacked(topic0)) == keccak256(abi.encodePacked(balanceLPSubtractEventTopic))) {
            address receiver = topic2;
            address lptoken = topic1;
            balanceLP.subtractTokens(lptoken, receiver, amount);
            emit BalanceLPSubtractEvent(lptoken, receiver, amount);
        }
    }
}
