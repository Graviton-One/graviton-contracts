//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IRelayRouter.sol";

/// @title RelayRouter
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract RelayRouter is IRelayRouter {
    /// @inheritdoc IOracleRouterV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IRelayRouter
    bytes32 public override relayTopic;
    /// @inheritdoc IRelayRouter
    address public override wallet;
    /// @inheritdoc IRelayRouter
    IERC20 public override gton;
    /// @inheritdoc IRelayRouter
    IWETH public override wnative;
    /// @inheritdoc IRelayRouter
    IUniswapV2Router01 public override router;

    /// @inheritdoc IOracleRouterV2
    mapping(address => bool) public override canRoute;

    receive() external payable {
        assert(msg.sender == address(wnative)); // only accept ETH via fallback from the WETH contract
    }

    constructor(
        address _wallet,
        IERC20 _gton,
        bytes32 _relayTopic,
        IWETH _wnative,
        IUniswapV2Router01 _router
    ) {
        owner = msg.sender;
        wallet = _wallet;
        gton = _gton;
        relayTopic = _relayTopic;
        wnative = _wnative;
        router = _router;
    }

    /// @inheritdoc IOracleRouterV2
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IRelayRouter
    function setWallet(address _wallet) public override isOwner {
        address walletOld = wallet;
        wallet = _wallet;
        emit SetWallet(walletOld, _wallet);
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

    /// @inheritdoc IRelayRouter
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
            gton.transferFrom(wallet, address(this), amount);
            gton.approve(address(router), amount);
            address[] memory path = new address[](2);
            path[0] = address(gton);
            path[1] = address(wnative);
            address pair = IUniswapV2Factory(router.factory()).getPair(address(gton), address(wnative));
            uint112 reserve0;
            uint112 reserve1;
            (reserve0, reserve1,) = IUniswapV2Pair(pair).getReserves();
            uint256 quote = router.getAmountOut(amount, reserve0, reserve1);
            uint[] memory amounts = router.swapExactTokensForTokens(amount, quote, path, address(this), block.timestamp+3600);
            wnative.withdraw(amounts[1]);
            address payable user = payable(deserializeAddress(receiver, 0));
            user.transfer(amounts[1]);
            emit DeliverRelay(user, amounts[0]);
        }
        emit RouteValue(uuid, chain, emiter, token, sender, receiver, amount);
    }
}
