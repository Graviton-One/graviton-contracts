//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title Farm
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract Farm {

    address public owner;

    uint public totalUnlocked;

    uint public lastClaimedTimestamp;
    uint public startTimestampOffset;
    uint public c;
    uint public a;

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

    constructor(address _owner, uint _a, uint _c) {
        owner = _owner;
        a = _a;
        c = _c;
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

        uint lastY    = a * (1e18) / (lastTimestamp    + a / c - startTimestampOffset);
        uint currentY = a * (1e18) / (currentTimestamp + a / c - startTimestampOffset);

        uint addAmount = lastY - currentY;

        lastClaimedTimestamp = currentTimestamp;

        totalUnlocked += addAmount;
    }
}
