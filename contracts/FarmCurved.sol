//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IFarm.sol";

/// @title FarmCurved
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract FarmCurved is IFarm {

    address public override owner;

    uint public override totalUnlocked;

    uint public override lastClaimedTimestamp;
    uint public override startTimestampOffset;
    uint public c;
    uint public a;

    bool public override deprecated = false;
    bool public override farmingStarted = false;

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

    constructor(address _owner, uint _a, uint _c) {
        owner = _owner;
        a = _a;
        c = _c;
    }

    /// @dev Returns the block timestamp. This method is overridden in tests.
    function _blockTimestamp() internal view virtual returns (uint) {
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

        uint lastTimestamp    = lastClaimedTimestamp;
        uint currentTimestamp = _blockTimestamp();

        uint lastY    = a * (1e18) / (lastTimestamp    + a / c - startTimestampOffset);
        uint currentY = a * (1e18) / (currentTimestamp + a / c - startTimestampOffset);

        uint addAmount = lastY - currentY;

        lastClaimedTimestamp = currentTimestamp;

        totalUnlocked += addAmount;
    }
}
