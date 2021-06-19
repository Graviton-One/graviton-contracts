//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IFarm.sol";

/// @title FarmLinear
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract FarmLinear is IFarm {

    /// @inheritdoc IFarm
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
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

    uint256 public amount;
    uint256 public period;

    constructor(
        address _owner,
        uint256 _amount,
        uint256 _period,
        uint256 _startTimestamp
    ) {
        owner = _owner;
        amount = _amount;
        period = _period;
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
        require(farmingStarted, "farming is not started yet");
        require(!farmingStopped, "farming has been stopped.");

        uint256 currentTimestamp = _blockTimestamp();

        uint256 lastY = (amount * (lastTimestamp - startTimestamp) * (1e18)) /
            period;
        uint256 currentY = (amount *
            (currentTimestamp - startTimestamp) *
            (1e18)) / period;

        uint256 addAmount = currentY - lastY;

        lastTimestamp = currentTimestamp;

        totalUnlocked += addAmount;
    }
}
