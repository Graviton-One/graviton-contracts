//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IFarm.sol";

/// @title FarmLinear
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract FarmLinear is IFarm {
    address public override owner;

    uint256 public override totalUnlocked;

    uint256 public override lastClaimedTimestamp;
    uint256 public override startTimestampOffset;
    uint256 public amount;
    uint256 public period;

    bool public override deprecated;
    bool public override farmingStarted;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    event SetOwner(address ownerOld, address ownerNew);

    function setOwner(address _owner) public override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setDeprecated() public override isOwner {
        deprecated = true;
    }

    constructor(
        address _owner,
        uint256 _amount,
        uint256 _period,
        uint256 _startTimestampOffset
    ) {
        owner = _owner;
        amount = _amount;
        period = _period;
        if (_startTimestampOffset != 0) {
            farmingStarted = true;
            startTimestampOffset = _startTimestampOffset;
            lastClaimedTimestamp = startTimestampOffset;
        }
    }

    /// @dev Returns the block timestamp. This method is overridden in tests.
    function _blockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function startFarming() public override isOwner {
        if (!farmingStarted) {
            farmingStarted = true;
            startTimestampOffset = _blockTimestamp();
            lastClaimedTimestamp = startTimestampOffset;
        }
    }

    function unlockAsset() public override {
        require(farmingStarted, "farming is not started yet");
        require(!deprecated, "This contract is deprecated.");

        uint256 lastTimestamp = lastClaimedTimestamp;
        uint256 currentTimestamp = _blockTimestamp();

        uint256 lastY = (amount *
            (lastTimestamp - startTimestampOffset) *
            (1e18)) / period;
        uint256 currentY = (amount *
            (currentTimestamp - startTimestampOffset) *
            (1e18)) / period;

        uint256 addAmount = currentY - lastY;

        lastClaimedTimestamp = currentTimestamp;

        totalUnlocked += addAmount;
    }
}
