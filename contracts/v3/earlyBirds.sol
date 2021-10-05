//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IERC20.sol";

contract EarlyBirds {

    address public owner;
    
    struct EBInfo {
        uint256 amount;
        uint256 claimedAmount;
    }

    mapping (address => EBInfo) public EBShares;
    uint256 public totalDeposited;
    
    IERC20 public gton;
    bool public  farmingStarted;
    bool public  farmingStopped;
    bool public permissionlessShareTransferAllowed;
    uint256 public  startTimestamp;
    uint256 public c;
    uint256 public a;

    constructor(
        IERC20 _gton,
        address _owner,
        uint256 _a,
        uint256 _c,
        uint256 _startTimestamp
    ) {
        gton = _gton;
        owner = _owner;
        a = _a;
        c = _c;
        if (_startTimestamp != 0) {
            farmingStarted = true;
            startTimestamp = _startTimestamp;
        }
    }

    // owner control functions
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function transferOwnership(address _owner) public isOwner {
        owner = _owner;
    }

    function _blockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function startFarming() public isOwner {
        if (!farmingStarted) {
            farmingStarted = true;
            startTimestamp = _blockTimestamp();
        }
    }
    
    function togglePermissionlessShareTransfer() public isOwner {
        permissionlessShareTransferAllowed = !permissionlessShareTransferAllowed;
    }
    
    function migrateShare(address user, uint256 claimDebt, uint256 share) public isOwner {
        EBShares[user] = EBInfo({
            amount: share,
            claimedAmount: claimDebt
        });
        totalDeposited += share;
    }

    function stopFarming() public isOwner {
        farmingStopped = true;
    }

    function currentUnlocked() public view returns(uint256) {
        require(farmingStarted, "F1");
        require(!farmingStopped, "F2");
        uint256 currentTimestamp = _blockTimestamp();
        return (a * (1e18)) /
            (currentTimestamp + a / c - startTimestamp);
    }
    
    function claim(uint256 amount) public {
        EBInfo memory user = EBShares[msg.sender];
        uint256 userCurrentMaxAmount = currentUnlocked() *  user.amount / totalDeposited ;
        require(amount <= userCurrentMaxAmount - user.claimedAmount, 'too much to claim');
        require(gton.transfer(msg.sender, amount),"cant transfer gton");
        user.claimedAmount += amount;
    }
    
    function transferShare(address _from, address _to, uint256 _amount) public {
        if (!permissionlessShareTransferAllowed) {
            require(msg.sender==owner,"not owner");
        }
        EBInfo storage userFrom = EBShares[_from];  
        EBInfo storage userTo = EBShares[_to];  
        require(userFrom.amount >= _amount, "not enough");
        
        uint256 transerableClaimAmount = userFrom.claimedAmount * userFrom.amount / totalDeposited;
        userTo.claimedAmount += transerableClaimAmount;
        userFrom.claimedAmount -= transerableClaimAmount;
        userFrom.amount -= _amount;
        userTo.amount += _amount;
    }
    
}
