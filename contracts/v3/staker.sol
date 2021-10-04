pragma solidity 0.8.0;

import "../interfaces/IERC20.sol";

// import "@nomiclabs/buidler/console.sol";
// MasterChef is the master of Cake. He can make Cake and he is a fair guy.
// Note that it's ownable and the owner wields tremendous power. The ownership
// will be transferred to a governance smart contract once CAKE is sufficiently
// distributed and the community can show to govern itself.
// Have fun reading it. Hopefully it's bug-free. God bless.
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

    
    mapping (uint256 => mapping (address => UserInfo)) public userInfo; // Info of each user that stakes LP tokens.
    mapping (uint256 => FarmInfo) farmInfo; // Info of each farm.
    mapping (address => uint256) farmId; // farm id of this token address (0 if farm not used)
    uint256 farmCount;
    
    address owner;
    
    event Deposit(
        address indexed user, 
        uint256 indexed farm_id,
        address indexed initiator, 
        address provider, 
        uint256 amount
        );
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    modifier onlyOwner() {
        require(msg.sender==owner,'not owner');
        _;
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

    function innerClaim(FarmInfo storage farm, UserInfo storage user) private {
        if (user.providingAmount > 0) {
            uint256 currentReward = user.providingAmount * farm.accRewardPerShare / 1e12 - user.rewardDebt;
            farm.rewardToken.transfer(msg.sender,currentReward);
            farm.totalRewardsLeft -= currentReward;
        }
    }

    function claimReward(uint256 _farmId) public {
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][msg.sender];
        innerClaim(farm,user);
        user.rewardDebt = user.providingAmount * farm.accRewardPerShare * 1e12;
    }

    function depositFor(uint256 _farmId, uint256 _amount, address _userAddress, address _userProvider) public {
        require ( _farmId != 0, 'no farm index 1');
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][_userAddress];
        innerClaim(farm,user);
        require(farm.providingToken.transferFrom(_userProvider,address(this),_amount),"cant transfer for deposit");
        user.providingAmount += _amount;
        farm.totalProvidnigToken += _amount;
        user.rewardDebt = user.providingAmount * farm.accRewardPerShare * 1e12;
        emit Deposit(_userAddress, _farmId, msg.sender, _userProvider, _amount);
    }

    function deposit(uint256 _farmId, uint256 _amount) public {
        depositFor(_farmId,_amount,msg.sender,msg.sender);
    }

    function withdraw(uint256 _farmId, uint256 _amount) public {
        require ( _farmId != 0, 'no farm index 1');
        FarmInfo storage farm = farmInfo[_farmId];
        UserInfo storage user = userInfo[_farmId][msg.sender];
        require(_amount <= user.providingAmount, "too much");
        innerClaim(farm,user);
        require(farm.providingToken.transferFrom(msg.sender,address(this),_amount),"cant transfer for deposit");
        user.providingAmount -= _amount;
        farm.totalProvidnigToken -= _amount;
        user.rewardDebt = user.providingAmount * farm.accRewardPerShare * 1e12;
        emit Withdraw(msg.sender, _farmId, _amount);
    }
    
    // only used for reward and providing token same
    function DepositClaimedForUser(uint256 _farmId, address _userAddress) public {
        require ( _farmId != 0, 'no farm index 1');
        FarmInfo storage farm = farmInfo[_farmId];
        require ( farm.providingToken == farm.rewardToken, 'not allowed');
        UserInfo storage user = userInfo[_farmId][_userAddress];
        
        uint256 pastReward = user.providingAmount * farm.accRewardPerShare / 1e12 - user.rewardDebt;
        farm.totalRewardsLeft -= pastReward;
        
        user.providingAmount += pastReward;
        farm.totalProvidnigToken += pastReward;
        
        user.rewardDebt = user.providingAmount * farm.accRewardPerShare * 1e12;
    }
    
    function DepositClaimed(uint256 _farmId) public {
        DepositClaimedForUser(_farmId,msg.sender);
    }
    
}