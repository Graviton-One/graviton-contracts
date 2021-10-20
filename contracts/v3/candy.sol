//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IERC20 {
    function mint(address _to, uint256 _value) external;

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function increaseAllowance(address spender, uint256 addedValue)
        external
        returns (bool);

    function transfer(address _to, uint256 _value)
        external
        returns (bool success);

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool success);

    function balanceOf(address _owner) external view returns (uint256 balance);
    function totalSupply() external view returns (uint256 supply);
}


interface IPoolProxy {
    function addLiquidity(address pool,uint gtonAmount,uint secondTokenAmount) external returns (uint liquidity);
    function removeLiquidity(uint lpTokenAmount,address pool,uint requestedAmount) external returns (uint amountFirst, uint amountSecond);
    function getGtonAmountForAddLiquidity(address _pool,uint secondTokenAmount) external view returns (uint gtonAmount);
    function getPoolTokens(address pool) external returns (address firstToken, address secondToken);
    function getAddLiquidityApprove(address pool) external returns (address addr);
    function getPoolReserves(address pool) external returns (uint reserveFirst, uint reserveSecond);
    function takeLiquidityFee(address pool) external returns (uint fee);
    function sendLiquidity(address _user, address pool, uint _providedAmount) external returns (uint lpAmount);
}

interface IFarmProxy {
    function sendToFarming(address farm, uint amount) external;
    function claimReward(address farm, uint farmId) external returns(uint);
    function pendingReward(address farm) external view returns(uint);
    function takeFromFarming(address farm, uint amount) external;
    function getFarmingApprove(address farm) external returns (address addr);
}

contract CandyShop {
    
    struct UserTokenData {
        uint providedAmount;
        uint lpAmount;
        uint rewardDebt;
        uint aggregatedReward;
    }
    
    struct CanData {
        uint totalProvidedTokenAmount;
        uint accRewardPerShare;
        uint totalRewardsClaimed;
        address farmAddress;
        uint farmId;
        IFarmProxy farmProxy;
        IPoolProxy poolProxy;
        IERC20 lpToken;
        IERC20 providingToken;
        IERC20 rewardToken;
        uint fee;
    }
    
    bool public revertFlag;
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender==owner,'not owner');
        _;
    }
    
    modifier notReverted() {
        require(!revertFlag,'not owner');
        _;
    }
    
    function toggleRevert() public onlyOwner {
        revertFlag = !revertFlag;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
    
    mapping (uint => CanData) public canInfo;
    mapping (uint => mapping (address => UserTokenData)) public usersInfo;
    uint public lastStackId;
    
    function createCan (
        address _farmAddress,
        uint _farmId,
        IFarmProxy _farmProxy,
        IPoolProxy _poolProxy,
        IERC20 _lpToken,
        IERC20 _providingToken,
        IERC20 _rewardToken,
        uint _fee
    ) public onlyOwner {
        lastStackId++;
        
        canInfo[lastStackId] = CanData({
            totalProvidedTokenAmount: 0,
            accRewardPerShare: 0,
            totalRewardsClaimed: 0,
            farmAddress: _farmAddress,
            farmId: _farmId,
            farmProxy: _farmProxy,
            poolProxy: _poolProxy,
            lpToken: _lpToken,
            providingToken: _providingToken,
            rewardToken: _rewardToken,
            fee: _fee
        });
        
    }
    
    function updateCan (uint _can_id) public notReverted {
        CanData memory canData = canInfo[_can_id];
        uint newPortion = (canData.farmProxy.claimReward(canData.farmAddress,canData.farmId) - canData.totalRewardsClaimed);
        canData.accRewardPerShare += newPortion * 1e12 / canData.totalProvidedTokenAmount;
    }

    // creates some can tokens for user in declared stack
    function mintFor(address _user, uint _can_id, uint _providedAmount) public notReverted {
        // getting user and stack info from mappings
        UserTokenData memory userTokenData = usersInfo[_can_id][_user];
        CanData memory canData = canInfo[_can_id];
        updateCan(_can_id);
        
        (uint lpAmount) = canData.poolProxy.sendLiquidity(_user, address(canData.lpToken), _providedAmount);
        // get pool infor and gton amount 
        // send lp tokens to farming
        require(canData.lpToken.approve(canData.farmProxy.getFarmingApprove(canData.farmAddress),lpAmount),"not enough"); 
        canData.farmProxy.sendToFarming(address(canData.lpToken), lpAmount);
    
        // previous pending reward goes to aggregated reward
        userTokenData.aggregatedReward = lpAmount * canData.accRewardPerShare / 1e12 - userTokenData.rewardDebt;
        // incrementing provided and lp amount
        userTokenData.providedAmount += _providedAmount;
        userTokenData.lpAmount += lpAmount;
        // updating reward reward debt
        userTokenData.rewardDebt = userTokenData.lpAmount * canData.accRewardPerShare / 1e12;
        
        canData.totalProvidedTokenAmount += lpAmount;
    }
    
    
    // creates some can tokens for user in declared stack
    function burnFor(address _user, uint _can_id, uint _providedAmount, uint _rewardAmount) public notReverted {
        // getting user and stack info from mappings
        UserTokenData memory userTokenData = usersInfo[_can_id][_user];
        CanData memory canData = canInfo[_can_id];
        updateCan(_can_id);
        
        // calculate lp amount
        require(_providedAmount <= userTokenData.providedAmount, "insufficent amount");
        uint lpAmount = _providedAmount * userTokenData.lpAmount / userTokenData.providedAmount;
        
        (uint reserveFirst,) = canData.poolProxy.getPoolReserves(address(canData.lpToken));
        
        uint lpAmountToTake = (_providedAmount * canData.lpToken.totalSupply() / reserveFirst) 
            + canData.poolProxy.takeLiquidityFee(address(canData.lpToken));
        (address firstTokenAddress,) = canData.poolProxy.getPoolTokens(address(canData.lpToken));

        canData.farmProxy.takeFromFarming(address(canData.lpToken),lpAmountToTake);
        // we need to transfer the token to proxy to delegate remove operation
        require(canData.lpToken.approve(address(canData.poolProxy), lpAmountToTake),'Error approving to proxy');
        (uint amountFirst,) = canData.poolProxy.removeLiquidity(lpAmountToTake,address(canData.lpToken), _providedAmount);
        
        require(IERC20(firstTokenAddress).transfer(_user,amountFirst),'lol');

        // previous pending reward goes to aggregated reward
        userTokenData.aggregatedReward += lpAmount * canData.accRewardPerShare / 1e12 - userTokenData.rewardDebt;
        require(_rewardAmount <= userTokenData.aggregatedReward, "insufficent amount");
        require(canData.rewardToken.transfer(_user,(_rewardAmount - canData.fee)),'lol');
        
        // decrementing provided and lp amount and aggregatedReward
        userTokenData.aggregatedReward -= _rewardAmount;
        userTokenData.providedAmount -= _providedAmount;
        userTokenData.lpAmount -= lpAmount;
        // updating reward reward debt
        userTokenData.rewardDebt = userTokenData.lpAmount * canData.accRewardPerShare / 1e12;
        
        canData.totalProvidedTokenAmount -= lpAmount;
    }
    
    function transfer(address _from, address _to, uint _can_id, uint _providingAmount, uint _rewardAmount) public notReverted {
        require(msg.sender == _from, 'not allowed');
 
        UserTokenData memory from_data = usersInfo[_can_id][_to];       
        UserTokenData memory to_data = usersInfo[_can_id][_from];
        CanData memory canData = canInfo[_can_id];
        updateCan(_can_id);
        
        require(_providingAmount <= from_data.providedAmount, "insufficent amount");
        uint lpAmount = _providingAmount * from_data.lpAmount / from_data.providedAmount;
        
        from_data.aggregatedReward += from_data.lpAmount * canData.accRewardPerShare / 1e12 - from_data.rewardDebt;
        to_data.aggregatedReward += to_data.lpAmount * canData.accRewardPerShare / 1e12 - to_data.rewardDebt;
       
        require(_rewardAmount <= from_data.aggregatedReward, "insufficent amount"); 
        to_data.aggregatedReward += _rewardAmount;
        from_data.aggregatedReward -= _rewardAmount;

        // decrementing provided and lp amount and aggregatedReward
        from_data.providedAmount -= _providingAmount;
        from_data.lpAmount -= lpAmount;
        
        to_data.providedAmount += _providingAmount;
        to_data.lpAmount += lpAmount;
        
        // updating reward reward debt
        from_data.rewardDebt = from_data.lpAmount * canData.accRewardPerShare / 1e12;
        to_data.rewardDebt = to_data.lpAmount * canData.accRewardPerShare / 1e12;
    }
    
}
