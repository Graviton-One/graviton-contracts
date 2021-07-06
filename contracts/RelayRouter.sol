//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IERC20.sol";
import "./interfaces/IOracleRouterV2.sol";

interface IRelayRouter is IOracleRouterV2 {
    function relayTopic() external view returns (bytes32);

    function wallet() external view returns (address);

    function gton() external view returns (IERC20);

    function setWallet(address _wallet) external;

    function setRelayTopic(bytes32 _relayTopic) external;

    event DeliverRelay(address user, uint256 amount);

    event SetRelayTopic(bytes32 topicOld, bytes32 topicNew);

    event SetWallet(address walletOld, address walletNew);
}

interface WNative {
     function deposit() external payable;

     function withdraw(uint wad) external;
}
interface V2Router {
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint[] memory amounts);
}

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
    WNative wnative;
    V2Router router;

    /// @inheritdoc IOracleRouterV2
    mapping(address => bool) public override canRoute;

    constructor(
        address _wallet,
        IERC20 _gton,
        bytes32 _relayTopic,
        WNative _wnative,
        V2Router _router
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
            // TODO: transfer gton from wallet
            gton.transferFrom(wallet, address(this), amount);
            // TODO: swap gton for native on DEX
            address[] memory path = new address[](2);
            path[0] = address(gton);
            path[1] = address(wnative);
            uint[] memory amounts = router.swapExactTokensForTokens(amount, 0, path, address(this), block.timestamp+3600);
            // TODO: withdraw native from wrapped
            wnative.withdraw(amounts[0]);
            // TODO: transfer native to receiver
            address payable user = payable(deserializeAddress(receiver, 0));
            user.transfer(amounts[0]);
            // TODO: throw event
            emit DeliverRelay(user, amounts[0]);
        }

        emit RouteValue(uuid, chain, emiter, token, sender, receiver, amount);
    }
}
