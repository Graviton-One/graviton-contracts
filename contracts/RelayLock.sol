//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IRelayLock.sol";

/// @title RelayLock
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract RelayLock is IRelayLock {

    /// @inheritdoc IRelayLock
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IRelayLock
    IWETH public override wnative;
    /// @inheritdoc IRelayLock
    IUniswapV2Router01 public override router;
    /// @inheritdoc IRelayLock
    IERC20 public override gton;

    /// @inheritdoc IRelayLock
    mapping (string => uint256) public override feeMin;
    /// @inheritdoc IRelayLock
    /// @dev 30000 = 30%, 200 = 0.2%, 1 = 0.001%
    mapping (string => uint256) public override feePercent;

    constructor (IWETH _wnative, IUniswapV2Router01 _router, IERC20 _gton) {
        owner = msg.sender;
        wnative = _wnative;
        router = _router;
        gton = _gton;
    }

    /// @inheritdoc IRelayLock
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IRelayLock
    function setFees(string calldata destination, uint256 _feeMin, uint256 _feePercent) external override {
        feeMin[destination] = _feeMin;
        feePercent[destination] = _feePercent;
    }

    /// @inheritdoc IRelayLock
    function lock(string calldata destination, bytes calldata receiver) external payable override {
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
        // check that the amount is larger than the fee
        require(amountMinusFee > 0, "RL1");
        // emit event to notify oracles and initiate crosschain transfer
        emit Lock(destination, receiver, destination, receiver, amountMinusFee);
    }

    /// @inheritdoc IRelayLock
    function reclaimERC20(IERC20 token) external override isOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    /// @inheritdoc IRelayLock
    function reclaimNative(uint256 amount) external override isOwner {
        payable(msg.sender).transfer(amount);
    }
}
