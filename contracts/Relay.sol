//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IRelay.sol";

/// @title Relay
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract Relay is IRelay {
    /// @inheritdoc IRelay
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
    ILogger public override logger;

    /// @inheritdoc IRelay
    mapping(address => bool) public override canRoute;

    string public _origin;

    uint256 public nonce;

    mapping(string => Chain) public override chains;

    receive() external payable {
        // only accept ETH via fallback from the WETH contract
        assert(msg.sender == address(wnative));
    }

    constructor(
        IWETH _wnative,
        IUniswapV2Router01 _router,
        IERC20 _gton,
        ILogger _logger,
        string memory origin,
        string[] memory _chains,
        uint256[3][] memory fees,
        uint256[2][] memory limits
    ) {
        owner = msg.sender;
        wnative = _wnative;
        router = _router;
        gton = _gton;
        logger = _logger;
        _origin = origin;
        setChains(_chains, fees, limits);
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

    /// @inheritdoc IRelay
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
        chains[chain].isAllowedChain = newBool;
        emit SetIsAllowedChain(chain, newBool);
    }

    /// @inheritdoc IRelay
    function setFees(
        string calldata destination,
        uint256 _feeMin,
        uint256 _feeMax,
        uint256 _feePercent
    ) external override isOwner {
        chains[destination].feeMin = _feeMin;
        chains[destination].feeMax = _feeMax;
        chains[destination].feePercent = _feePercent;
        emit SetFees(destination, _feeMin, _feeMax, _feePercent);
    }

    /// @inheritdoc IRelay
    function setLimits(
        string calldata destination,
        uint256 _lowerLimit,
        uint256 _upperLimit
    ) external override isOwner {
        chains[destination].lowerLimit = _lowerLimit;
        chains[destination].upperLimit = _upperLimit;
        emit SetLimits(destination, _lowerLimit, _upperLimit);
    }

    function setChains(
        string[] memory _chains,
        uint256[3][] memory fees,
        uint256[2][] memory limits
    ) public override isOwner {
        for (uint256 i = 0; i < _chains.length; i++) {
            Chain memory chain = chains[_chains[i]];
            chain.isAllowedChain = true;
            chain.feeMin = fees[i][0];
            chain.feeMax = fees[i][1];
            chain.feePercent = fees[i][2];
            chain.lowerLimit = limits[i][0];
            chain.upperLimit = limits[i][1];
            chains[_chains[i]] = chain;
        }
        emit SetChains(_chains, fees, limits);
    }

    /// @inheritdoc IRelay
    function setCanRoute(address parser, bool _canRoute)
        external
        override
        isOwner
    {
        canRoute[parser] = _canRoute;
        emit SetCanRoute(msg.sender, parser, canRoute[parser]);
    }

    /// @inheritdoc IRelay
    function reclaimERC20(IERC20 token, uint256 amount)
        external
        override
        isOwner
    {
        token.transfer(msg.sender, amount);
    }

    /// @inheritdoc IRelay
    function reclaimNative(uint256 amount) external override isOwner {
        payable(msg.sender).transfer(amount);
    }

    function _swapLock(uint256 amountLock)
        internal
        returns (uint256 amountSwap)
    {
        // wrap native tokens
        wnative.deposit{value: amountLock}();
        // trade wrapped native tokens for relay tokens
        wnative.approve(address(router), amountLock);
        address[] memory path = new address[](2);
        path[0] = address(wnative);
        path[1] = address(gton);
        uint256[] memory amounts = router.swapExactTokensForTokens(
            amountLock,
            0,
            path,
            address(this),
            block.timestamp + 3600
        );
        return amounts[1];
    }

    function _swapUnlock(uint256 amountRelay)
        internal
        returns (uint256 amountUnlock)
    {
        // trade relay tokens for wrapped native tokens
        gton.approve(address(router), amountRelay);
        address[] memory path = new address[](2);
        path[0] = address(gton);
        path[1] = address(wnative);
        uint256[] memory amounts = router.swapExactTokensForTokens(
            amountRelay,
            0,
            path,
            address(this),
            block.timestamp + 3600
        );
        amountUnlock = amounts[1];
        // unwrap to get native tokens
        wnative.withdraw(amountUnlock);
    }

    function _subtractFee(
        string calldata destination,
        uint256 amount0,
        uint256 amount1
    ) internal returns (uint256 amountMinusFee) {
        Chain memory chain = chains[destination];
        uint256 fee = (amount1 * chain.feePercent) / 100000;
        if (fee < chain.feeMin) {
            amountMinusFee = amount1 - chain.feeMin;
        } else if (fee < chain.feeMax) {
            amountMinusFee = amount1 - fee;
        } else {
            amountMinusFee = amount1 - chain.feeMax;
        }
        // check that remainder after subtracting fees is larger than 0
        require(amountMinusFee > 0, "R4");

        emit SubtractFee(
            amount0,
            amount1,
            chain.feeMin,
            chain.feeMax,
            chain.feePercent,
            fee,
            amountMinusFee
        );
    }

    function _logLock(
        bytes32 lockHash,
        string memory origin,
        string calldata destination,
        bytes memory sender,
        uint256 amountLock,
        bytes calldata receiver,
        uint256 amountRelay
    ) internal {
        bytes32 topic0 = keccak256(
            "Lock(string,bytes32,string,string,bytes,uint256,bytes,uint256)"
        );
        bytes32 topic1 = keccak256(abi.encodePacked(destination));
        bytes32 topic2 = lockHash;
        bytes32 topic3;
        bytes memory data = abi.encode(
            origin,
            destination,
            sender,
            amountLock,
            receiver,
            amountRelay
        );

        logger.log(
            topic0,
            abi.encodePacked(topic0, topic1, topic2, topic3, data)
        );
    }

    function _emitLock(
        bytes32 lockHash,
        string memory origin,
        string calldata destination,
        bytes memory sender,
        uint256 amountLock,
        bytes calldata receiver,
        uint256 amountRelay
    ) internal {
        // emit event to notify oracles and initiate crosschain transfer
        emit Lock(
            destination,
            lockHash,
            origin,
            destination,
            sender,
            amountLock,
            receiver,
            amountRelay
        );

        // emit event to index transactions by sender and receiver
        emit Lock_(
            destination,
            sender,
            receiver,
            lockHash,
            origin,
            destination,
            sender,
            amountLock,
            receiver,
            amountRelay
        );
    }

    function _logUnlock(
        bytes32 lockHash,
        string memory origin,
        string memory destination,
        bytes memory sender,
        uint256 amountRelay,
        bytes memory receiver,
        uint256 amountUnlock
    ) internal {
        bytes32 topic0 = keccak256(
            "Unlock(string,bytes32,string,string,bytes,uint256,bytes,uint256)"
        );
        bytes32 topic1 = keccak256(abi.encodePacked(origin));
        bytes32 topic2 = lockHash;
        bytes32 topic3;
        bytes memory data = abi.encode(
            origin,
            destination,
            sender,
            amountRelay,
            receiver,
            amountUnlock
        );

        logger.log(
            topic0,
            abi.encodePacked(topic0, topic1, topic2, topic3, data)
        );
    }

    function _emitUnlock(
        bytes32 lockHash,
        string memory origin,
        string memory destination,
        bytes memory sender,
        uint256 amountRelay,
        bytes memory receiver,
        uint256 amountUnlock
    ) internal {
        // emit event to notify oracles and complete crosschain transfer
        emit Unlock(
            origin,
            lockHash,
            origin,
            destination,
            sender,
            amountRelay,
            receiver,
            amountUnlock
        );

        // emit event to index transactions by sender and receiver
        emit Unlock_(
            origin,
            sender,
            receiver,
            lockHash,
            origin,
            destination,
            sender,
            amountRelay,
            receiver,
            amountUnlock
        );
    }

    /// @inheritdoc IRelay
    function lock(string calldata destination, bytes calldata receiver)
        external
        payable
        override
    {
        Chain memory chain = chains[destination];
        require(chain.isAllowedChain, "R1");
        uint256 amountLock = msg.value;
        require(amountLock > chain.lowerLimit, "R2");
        require(amountLock < chain.upperLimit, "R3");

        uint256 amountSwap = _swapLock(amountLock);

        // subtract fee
        uint256 amountRelay = _subtractFee(destination, amountLock, amountSwap);

        bytes memory sender = abi.encodePacked(msg.sender);
        string memory origin = _origin;
        bytes32 lockHash = keccak256(
            abi.encode(
                origin,
                destination,
                sender,
                amountLock,
                receiver,
                amountRelay,
                block.number,
                nonce
            )
        );
        nonce++;

        _logLock(
            lockHash,
            origin,
            destination,
            sender,
            amountLock,
            receiver,
            amountRelay
        );

        _emitLock(
            lockHash,
            origin,
            destination,
            sender,
            amountLock,
            receiver,
            amountRelay
        );
    }

    function unlock(
        bytes32 lockHash,
        string memory origin,
        string memory destination,
        bytes memory sender,
        uint256 amountRelay,
        bytes memory receiver
    ) external override {
        require(canRoute[msg.sender], "ACR");

        uint256 amountUnlock = _swapUnlock(amountRelay);

        // transfer native tokens to the receiver
        address payable account = payable(deserializeAddress(receiver, 0));
        account.transfer(amountUnlock);

        _logUnlock(
            lockHash,
            origin,
            destination,
            sender,
            amountRelay,
            receiver,
            amountUnlock
        );

        _emitUnlock(
            lockHash,
            origin,
            destination,
            sender,
            amountRelay,
            receiver,
            amountUnlock
        );
    }
}
