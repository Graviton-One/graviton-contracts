pragma solidity 0.8.0;

import "../interfaces/IERC20.sol";

interface IEventStorage {
    function addDeposit(uint256 farm_id,address user,uint256 amount) external;
    function addWithdraw(uint256 farm_id,address user,uint256 amount) external;
    function addClaim(uint256 farm_id,address user,uint256 amount) external;
}

interface IFarmRewarder {
    function unlockReward(uint256 farm_id) external returns(uint256);
}

contract eventStorage {
    address public owner;
    address public mutator;
    mapping (uint => string) public events;
    uint lastEvent;
    
    constructor(
        address _owner,
        address _mutator
    ) {
        owner = _owner;
        mutator = _mutator;
    }
    
    modifier onlyOwner() {
        require(msg.sender==owner,'not owner');
        _;
    }
    
    function transferOwnership(address _to) public onlyOwner {
        owner = _to;
    }
    
    modifier onlyMutator() {
        require(msg.sender==owner,'not owner');
        _;
    }
    
    function setMutator(address _mutator) public onlyOwner {
        mutator = _mutator;
    }
    
    
    function addDeposit(uint256 farm_id,address user,uint256 amount) public onlyMutator onlyMutator {
        lastEvent++;
        events[lastEvent]=string(abi.encodePacked("deposit",farm_id,user,amount));
        
    }
    function addWithdraw(uint256 farm_id,address user,uint256 amount) public onlyMutator {
        lastEvent++;
        events[lastEvent]=string(abi.encodePacked("withdraw",farm_id,user,amount));
    }
    function addClaim(uint256 farm_id,address user,uint256 amount) public {
        lastEvent++;
        events[lastEvent]=string(abi.encodePacked("claim",farm_id,user,amount));
    }
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
        uint256 totalProvidingToken; // total current amount of user provided token
        uint256 totalRewards; // total rewards that were assigned to this farm
        uint256 totalRewardsLeft; // total token rewards that users haven't claimed yeе
        uint256 accRewardPerShare; // Accumulated reward per share, times 1e12. See below.
        address farmOwner; // owner of pool allowed to update pool rewarder sc
        IFarmRewarder farmRewarder; // contract that automaticly gives rewards to pool
    }
    
    IEventStorage public eventStorageSubscriber;
    
    mapping (uint256 => mapping (address => UserInfo)) public userInfo; // Info of each user that stakes LP tokens.
    mapping (uint256 => FarmInfo) public farmInfo; // Info of each farm.
    mapping (address => uint256) public farmId; // farm id of this token address (0 if farm not used)
    uint256 public farmCount;
    bool public permissionlessManagement;

    
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
        permissionlessManagement = false;
    }
    
    modifier onlyOwner() {
        require(msg.sender==owner,'not owner');
        _;
    }
    
    function updateFarmRewarder (uint256 _farmId, IFarmRewarder _rewarder) public {
        FarmInfo storage farm = farmInfo[_farmId];
        require(msg.sender==owner || (msg.sender==farm.farmOwner && permissionlessManagement),'not allowed');
        farm.farmRewarder = _rewarder;
    }
    
    function setEventStorage(IEventStorage _subscriber) public onlyOwner {
        eventStorageSubscriber = _subscriber;
    }
    
    function transferOwnership(address _to) public onlyOwner {
        owner = _to;
    }
    
    function togglePermissionlessManagement() public onlyOwner {
        permissionlessManagement = !permissionlessManagement;
    }

    // action with pool
    function addRewardFrom(uint256 _farmId, uint256 amount, address rewardFrom) public {
        FarmInfo storage farm = farmInfo[_farmId];
        require(msg.sender==owner || (msg.sender==farm.farmOwner && permissionlessManagement),'not allowed');
        require(farm.rewardToken.transferFrom(rewardFrom,address(this),amount), 'cant transfer amount');
        farm.accRewardPerShare += amount * 1e12 / farm.totalProvidingToken;
        farm.totalRewards += amount;
    }
    
    function updateFarmReward(uint256 _farmId) public {
        FarmInfo storage farm = farmInfo[_farmId];
        
        // if farm rewarder not set
        if (address(farm.farmRewarder) == address(0)) {
            return;
        }
        require(msg.sender==owner || (msg.sender==farm.farmOwner && permissionlessManagement),'not allowed');
        uint amount = farm.farmRewarder.unlockReward(_farmId);
        require(farm.rewardToken.transferFrom(address(farm.farmRewarder),address(this),amount), 'cant transfer amount');
        farm.accRewardPerShare += amount * 1e12 / farm.totalProvidingToken;
        farm.totalRewards += amount;
    }
    
    function addPool(IERC20 _providingToken, IERC20 _rewardToken, address _farmOwner) public {
        require(farmId[address(_providingToken)] == 0, "farm with this token already exisis");
        require(msg.sender==owner || permissionlessManagement,'not allowed');
        farmCount += 1;
        farmInfo[farmCount].rewardToken = _rewardToken;
        farmInfo[farmCount].providingToken = _providingToken;
        farmInfo[farmCount].farmOwner = _farmOwner;
        farmId[address(_providingToken)] = farmCount;
    }

    // farming actions
    function pendingReward(uint256 _farmId, address _user) external view returns (uint256) {
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][_user];
        uint256 accCakePerShare = farm.accRewardPerShare;
        return user.providingAmount * accCakePerShare * 1e12 / user.rewardDebt;
    }

    function innerClaim(FarmInfo storage farm, UserInfo storage user, address _userAddress, uint256 _farmId) private {
        if (user.providingAmount == 0) {
            return;
        }
        
        uint256 currentReward = user.providingAmount * farm.accRewardPerShare / 1e12 - user.rewardDebt;
        farm.rewardToken.transfer(_userAddress,currentReward);
        farm.totalRewardsLeft -= currentReward;
        
        if (eventStorageSubscriber != IEventStorage(address(0))) {
            eventStorageSubscriber.addClaim(_farmId,_userAddress,currentReward);
        }
        emit Claim(_userAddress, _farmId, currentReward);
    }

    function claimFor(uint256 _farmId, address _user) public {
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][_user];
        innerClaim(farm,user,_user,_farmId);
        user.rewardDebt = user.providingAmount * farm.accRewardPerShare * 1e12;
    }

    function depositFor(uint256 _farmId, uint256 _amount, address _userAddress) public {
        require ( _farmId != 0, 'no farm index 1');
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][_userAddress];
        innerClaim(farm,user,_userAddress,_farmId);
        
        require(farm.providingToken.transferFrom(_userAddress,address(this),_amount),'lol');
        user.providingAmount += _amount;
        farm.totalProvidingToken += _amount;
        user.rewardDebt = user.providingAmount * farm.accRewardPerShare * 1e12;
        
        if (eventStorageSubscriber != IEventStorage(address(0))) {
                eventStorageSubscriber.addDeposit(_farmId,_userAddress,_amount);
        }
        emit Deposit(_userAddress, _farmId, msg.sender, _amount);
    }

    function withdrawFor(uint256 _farmId, uint256 _amount, address _userAddress) public {
        require ( _farmId != 0, 'no farm index 1');
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][_userAddress];
        require(_amount <= user.providingAmount, "too much");
        innerClaim(farm,user,_userAddress,_farmId);
        
        require(farm.providingToken.transfer(_userAddress,_amount),'lol');
        user.providingAmount -= _amount;
        farm.totalProvidingToken -= _amount;
        user.rewardDebt = user.providingAmount * farm.accRewardPerShare * 1e12;
        
        if (eventStorageSubscriber != IEventStorage(address(0))) {
                eventStorageSubscriber.addClaim(_farmId,_userAddress,_amount);
        }
        emit Withdraw(_userAddress, _farmId, msg.sender, _amount);
    }
    
}