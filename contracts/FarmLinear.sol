//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IFarm.sol";

/// @title FarmLinear
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract FarmLinear is IFarm {

    address public owner;

    uint public override totalUnlocked;

    uint public lastClaimedTimestamp;
    uint public startTimestampOffset;
    uint public amount;
    uint public period;

    bool public deprecated = false;
    bool public farmingStarted = false;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    event SetOwner(address ownerOld, address ownerNew);

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setDeprecated() public isOwner {
        deprecated = true;
    }

    constructor(address _owner, uint _amount, uint _period) {
        owner = _owner;
        amount = _amount;
        period = _period;
    }

    /// @dev Returns the block timestamp. This method is overridden in tests.
    function _blockTimestamp() internal view virtual returns (uint) {
        return block.timestamp;
    }

    function startFarming() public isOwner {
        if (!farmingStarted) {
          farmingStarted = true;
          startTimestampOffset = _blockTimestamp();
          lastClaimedTimestamp = startTimestampOffset;
        }
    }

    function unlockAsset() public {
        require(farmingStarted, "farming is not started yet");
        require(!deprecated, "This contract is deprecated.");

        uint lastTimestamp    = lastClaimedTimestamp;
        uint currentTimestamp = _blockTimestamp();

        uint lastY    = (amount * (lastTimestamp    - startTimestampOffset) * (1e18)) / period;
        uint currentY = (amount * (currentTimestamp - startTimestampOffset) * (1e18)) / period;

        uint addAmount = currentY - lastY;

        lastClaimedTimestamp = currentTimestamp;

        totalUnlocked += addAmount;
    }
}
