pragma solidity 0.8.0;

import "../interfaces/IERC20.sol";

interface IEventStorage {
    function addDeposit(uint256 farm_id,address user,uint256 amount) external;
    function addWithdraw(uint256 farm_id,address user,uint256 amount) external;
    function addClaim(uint256 farm_id,address user,uint256 amount) external;
}

contract Staker {
    // Info of each user.
    struct UserInfo {
        uint256 providingAmount;     
        uint256 rewardDebt;
    } 
    // Info of each pool.
    struct FarmInfo {
        IERC20 rewardToken;  // gton is used in all cases for now
        IERC20 providingToken;  // token that users provide to farm 
        uint256 totalProvidnigToken; // total current amount of user provided token
        uint256 totalRewards; // total rewards that were assigned to this farm
        uint256 totalRewardsLeft; // total token rewards that users haven't claimed yeе
        uint256 accRewardPerShare; // Accumulated reward per share, times 1e12. See below.
    }
    
    IEventStorage public eventStorageSubscriber;

    mapping (address => bool) public mutationAllowance;
    
    function toggleMutationAllowance(address _mutator) public onlyOwner {
        mutationAllowance[_mutator] = !mutationAllowance[_mutator];
    }
    
    mapping (uint256 => mapping (address => UserInfo)) public userInfo; // Info of each user that stakes LP tokens.
    mapping (uint256 => FarmInfo) public farmInfo; // Info of each farm.
    mapping (address => uint256) public farmId; // farm id of this token address (0 if farm not used)
    uint256 public farmCount;
    
    address public owner;
    
    event Claim(
        address indexed user, 
        uint256 indexed farm_id,
        uint256 amount
    );
    event Deposit(
        address indexed user, 
        uint256 indexed farm_id,
        address indexed initiator, 
        uint256 amount
    );
    event Withdraw(
        address indexed user, 
        uint256 indexed farm_id,
        address indexed initiator, 
        uint256 amount
    );
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    modifier onlyMutator() {
        require(mutationAllowance[msg.sender],'not mutator');
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender==owner,'not owner');
        _;
    }
    
    function setEventStorage(IEventStorage _subscriber) public onlyOwner {
        eventStorageSubscriber = _subscriber;
    }
    
    function transferOwnership(address _to) public onlyOwner {
        owner = _to;
    }

    function addRewardFrom(uint256 _farmId, uint256 amount, address rewardFrom) public onlyOwner {
        FarmInfo storage farm = farmInfo[_farmId];
        require(farm.rewardToken.transferFrom(rewardFrom,address(this),amount), 'cant transfer amount');
        farm.accRewardPerShare += amount * 1e12 / farm.totalProvidnigToken;
        farm.totalRewards += amount;
    }

    function addPool(IERC20 _providingToken, IERC20 _rewardToken) public onlyOwner {
        require(farmId[address(_providingToken)] == 0, "farm with this token already exisis");
        farmCount += 1;
        farmInfo[farmCount].rewardToken = _rewardToken;
        farmInfo[farmCount].providingToken = _providingToken;
        farmId[address(_providingToken)] = farmCount;
    }

    // View function to see pending CAKEs on frontend.
    function pendingReward(uint256 _farmId, address _user) external view returns (uint256) {
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][_user];
        uint256 accCakePerShare = farm.accRewardPerShare;
        return user.providingAmount * accCakePerShare * 1e12 / user.rewardDebt;
    }

    function innerClaim(FarmInfo storage farm, UserInfo storage user, address _userAddress, uint256 _farmId) private {
        if (user.providingAmount > 0) {
            uint256 currentReward = user.providingAmount * farm.accRewardPerShare / 1e12 - user.rewardDebt;
            farm.rewardToken.transfer(_userAddress,currentReward);
            farm.totalRewardsLeft -= currentReward;
            if (eventStorageSubscriber != IEventStorage(address(0))) {
                eventStorageSubscriber.addClaim(_farmId,_userAddress,currentReward);
            }
            emit Claim(_userAddress, _farmId, currentReward);
        }
    }

    function claimFor(uint256 _farmId, address _user) public {
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][_user];
        innerClaim(farm,user,_user,_farmId);
        user.rewardDebt = user.providingAmount * farm.accRewardPerShare * 1e12;
    }

    function depositFor(uint256 _farmId, uint256 _amount, address _userAddress) public onlyMutator {
        require ( _farmId != 0, 'no farm index 1');
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][_userAddress];
        innerClaim(farm,user,_userAddress,_farmId);
        user.providingAmount += _amount;
        farm.totalProvidnigToken += _amount;
        user.rewardDebt = user.providingAmount * farm.accRewardPerShare * 1e12;
        if (eventStorageSubscriber != IEventStorage(address(0))) {
                eventStorageSubscriber.addDeposit(_farmId,_userAddress,_amount);
        }
        emit Deposit(_userAddress, _farmId, msg.sender, _amount);
    }

    function withdrawFor(uint256 _farmId, uint256 _amount, address _userAddress) public onlyMutator {
        require ( _farmId != 0, 'no farm index 1');
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][_userAddress];
        require(_amount <= user.providingAmount, "too much");
        innerClaim(farm,user,_userAddress,_farmId);
        user.providingAmount -= _amount;
        farm.totalProvidnigToken -= _amount;
        user.rewardDebt = user.providingAmount * farm.accRewardPerShare * 1e12;
        if (eventStorageSubscriber != IEventStorage(address(0))) {
                eventStorageSubscriber.addClaim(_farmId,_userAddress,_amount);
        }
        emit Withdraw(_userAddress, _farmId, msg.sender, _amount);
    }
    
}