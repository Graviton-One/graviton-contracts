//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title FarmLinear
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract FarmLinear {

    address public owner;

    uint public totalUnlocked;

    uint public lastClaimedTimestamp;
    uint public startTimestampOffset;
    uint public amount;
    uint public period;

    bool private notDeprecated = true;
    bool public farmingStarted = false;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function transferOwnership(address newOwnerAddress) public isOwner {
        owner = newOwnerAddress;
    }

    function setDeprecated() public isOwner {
        notDeprecated = false;
    }

    constructor(address _owner, uint _amount, uint _period) {
        owner = _owner;
        amount = _amount;
        period = _period;
    }

    function startFarming() public isOwner {
        farmingStarted = true;
        startTimestampOffset = block.timestamp;
        lastClaimedTimestamp = startTimestampOffset;
    }

    function unlockAsset() public {
        require(farmingStarted, "farming is not started yet");
        require(notDeprecated, "This contract is deprecated.");

        uint lastTimestamp    = lastClaimedTimestamp;
        uint currentTimestamp = block.timestamp;

        uint lastY    = (amount * (lastTimestamp    - startTimestampOffset) * (1e18)) / period;
        uint currentY = (amount * (currentTimestamp - startTimestampOffset) * (1e18)) / period;

        uint addAmount = currentY - lastY;

        lastClaimedTimestamp = currentTimestamp;

        totalUnlocked += addAmount;
    }
}
