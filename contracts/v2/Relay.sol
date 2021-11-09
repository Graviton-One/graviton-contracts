//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IRelay.sol";

/// @title Relay
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract Relay is IRelay {

    /// @inheritdoc IOracleRouterV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IRelay
    IWETH public override wnative;
    /// @inheritdoc IRelay
    IUniswapV2Router01 public override router;
    /// @inheritdoc IRelay
    IERC20 public override gton;

    /// @inheritdoc IRelay
    mapping (string => uint256) public override feeMin;
    /// @inheritdoc IRelay
    /// @dev 30000 = 30%, 200 = 0.2%, 1 = 0.001%
    mapping (string => uint256) public override feePercent;

    /// @inheritdoc IRelay
    mapping(string => uint256) public override lowerLimit;

    /// @inheritdoc IRelay
    mapping(string => uint256) public override upperLimit;

    /// @inheritdoc IRelay
    bytes32 public override relayTopic;

    /// @inheritdoc IOracleRouterV2
    mapping(address => bool) public override canRoute;

    /// @inheritdoc IRelay
    mapping(string => bool) public override isAllowedChain;

    receive() external payable {
        // only accept ETH via fallback from the WETH contract
        assert(msg.sender == address(wnative));
    }

    constructor (
        IWETH _wnative,
        IUniswapV2Router01 _router,
        IERC20 _gton,
        bytes32 _relayTopic,
        string[] memory allowedChains,
        uint[2][] memory fees,
        uint[2][] memory limits
    ) {
        owner = msg.sender;
        wnative = _wnative;
        router = _router;
        gton = _gton;
        relayTopic = _relayTopic;
        for (uint256 i = 0; i < allowedChains.length; i++) {
            isAllowedChain[allowedChains[i]] = true;
            feeMin[allowedChains[i]] = fees[i][0];
            feePercent[allowedChains[i]] = fees[i][1];
            lowerLimit[allowedChains[i]] = limits[i][0];
            upperLimit[allowedChains[i]] = limits[i][1];
        }
    }

    /// @inheritdoc IOracleRouterV2
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IRelay
    function setIsAllowedChain(string calldata chain, bool newBool)
        external
        override
        isOwner
    {
        isAllowedChain[chain] = newBool;
        emit SetIsAllowedChain(chain, newBool);
    }

    /// @inheritdoc IRelay
    function setFees(string calldata destination, uint256 _feeMin, uint256 _feePercent) external override isOwner {
        feeMin[destination] = _feeMin;
        feePercent[destination] = _feePercent;
        emit SetFees(destination, _feeMin, _feePercent);
    }

    /// @inheritdoc IRelay
    function setLimits(string calldata destination, uint256 _lowerLimit, uint256 _upperLimit) external override isOwner {
        lowerLimit[destination] = _lowerLimit;
        upperLimit[destination] = _upperLimit;
        emit SetLimits(destination, _lowerLimit, _upperLimit);
    }

    /// @inheritdoc IRelay
    function lock(string calldata destination, bytes calldata receiver) external payable override {
        require(isAllowedChain[destination], "R1");
        require(msg.value > lowerLimit[destination], "R2");
        require(msg.value < upperLimit[destination], "R3");
        // wrap native tokens
        wnative.deposit{value: msg.value}();
        // trade wrapped native tokens for relay tokens
        wnative.approve(address(router), msg.value);
        address[] memory path = new address[](2);
        path[0] = address(wnative);
        path[1] = address(gton);
        uint256[] memory amounts = router.swapExactTokensForTokens(msg.value, 0, path, address(this), block.timestamp+3600);
        // subtract fee
        uint256 amountMinusFee;
        uint256 fee = amounts[1] * feePercent[destination] / 100000;
        if (fee > feeMin[destination]) {
            amountMinusFee = amounts[1] - fee;
        } else {
            amountMinusFee = amounts[1] - feeMin[destination];
        }
        emit CalculateFee(amounts[0], amounts[1], feeMin[destination], feePercent[destination], fee, amountMinusFee);
        // check that remainder after subtracting fees is larger than 0
        require(amountMinusFee > 0, "R4");
        // emit event to notify oracles and initiate crosschain transfer
        emit Lock(destination, receiver, destination, receiver, amountMinusFee);
    }

    /// @inheritdoc IRelay
    function reclaimERC20(IERC20 token, uint256 amount) external override isOwner {
        token.transfer(msg.sender, amount);
    }

    /// @inheritdoc IRelay
    function reclaimNative(uint256 amount) external override isOwner {
        payable(msg.sender).transfer(amount);
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

    /// @inheritdoc IRelay
    function setRelayTopic(bytes32 _relayTopic) external override isOwner {
        bytes32 topicOld = relayTopic;
        relayTopic = _relayTopic;
        emit SetRelayTopic(topicOld, _relayTopic);
    }

    function equal(bytes32 a, bytes32 b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function deserializeUint(
        bytes memory b,
        uint256 startPos,
        uint256 len
    ) internal pure returns (uint256) {
        uint256 v = 0;
        for (uint256 p = startPos; p < startPos + len; p++) {
            v = v * 256 + uint256(uint8(b[p]));
        }
        return v;
    }

    function deserializeAddress(bytes memory b, uint256 startPos)
        internal
        pure
        returns (address)
    {
        return address(uint160(deserializeUint(b, startPos, 20)));
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
        if (equal(topic0, relayTopic)) {
            // trade relay tokens for wrapped native tokens
            gton.approve(address(router), amount);
            address[] memory path = new address[](2);
            path[0] = address(gton);
            path[1] = address(wnative);
            uint[] memory amounts = router.swapExactTokensForTokens(amount, 0, path, address(this), block.timestamp+3600);
            // unwrap to get native tokens
            wnative.withdraw(amounts[1]);
            // transfer native tokens to the receiver
            address payable user = payable(deserializeAddress(receiver, 0));
            user.transfer(amounts[1]);
            emit DeliverRelay(user, amounts[0], amounts[1]);
        }
        emit RouteValue(uuid, chain, emiter, token, sender, receiver, amount);
    }
}

