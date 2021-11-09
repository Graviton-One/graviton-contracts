//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IFarm.sol";

/// @title FarmCurved
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract FarmCurved is IFarm {
    /// @inheritdoc IFarm
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IFarm
    bool public override farmingStarted;
    /// @inheritdoc IFarm
    bool public override farmingStopped;

    /// @inheritdoc IFarm
    uint256 public override startTimestamp;
    /// @inheritdoc IFarm
    uint256 public override lastTimestamp;
    /// @inheritdoc IFarm
    uint256 public override totalUnlocked;

    uint256 public c;
    uint256 public a;

    constructor(
        uint256 _a,
        uint256 _c,
        uint256 _startTimestamp
    ) {
        owner = msg.sender;
        a = _a;
        c = _c;
        if (_startTimestamp != 0) {
            farmingStarted = true;
            startTimestamp = _startTimestamp;
            lastTimestamp = startTimestamp;
        }
    }

    /// @inheritdoc IFarm
    function setOwner(address _owner) public override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @dev Returns the block timestamp. This method is overridden in tests.
    function _blockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    /// @inheritdoc IFarm
    function startFarming() public override isOwner {
        if (!farmingStarted) {
            farmingStarted = true;
            startTimestamp = _blockTimestamp();
            lastTimestamp = startTimestamp;
        }
    }

    /// @inheritdoc IFarm
    function stopFarming() public override isOwner {
        farmingStopped = true;
    }

    /// @inheritdoc IFarm
    function unlockAsset() public override {
        require(farmingStarted, "F1");
        require(!farmingStopped, "F2");

        uint256 currentTimestamp = _blockTimestamp();

        uint256 lastY = (a * (1e18)) / (lastTimestamp + a / c - startTimestamp);
        uint256 currentY = (a * (1e18)) /
            (currentTimestamp + a / c - startTimestamp);

        uint256 addAmount = lastY - currentY;

        lastTimestamp = currentTimestamp;

        totalUnlocked += addAmount;
    }
}
