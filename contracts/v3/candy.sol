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

interface IPoolPair {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function PERMIT_TYPEHASH() external pure returns (bytes32);
    function nonces(address owner) external view returns (uint);

    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    function MINIMUM_LIQUIDITY() external pure returns (uint);
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function price0CumulativeLast() external view returns (uint);
    function price1CumulativeLast() external view returns (uint);
    function kLast() external view returns (uint);

    function mint(address to) external returns (uint liquidity);
    function burn(address to) external returns (uint amount0, uint amount1);
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function skim(address to) external;
    function sync() external;

    function initialize(address, address) external;
}


interface IPoolProxy {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);
    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountToken, uint amountETH);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);

    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}


interface IFarmProxy {
    function deposit(uint256 _pid, uint256 _amount) external;
    function withdraw(uint256 _pid, uint256 _amount) external;
    function pendingRelict(uint256 _pid, address _user) external view returns (uint256);
}

contract CandyShop {
    
    struct UserTokenData {
        uint providedAmount;
        uint farmingAmount;
        uint rewardDebt;
        uint aggregatedReward;
    }
    
    struct CanData {
        uint totalProvidedTokenAmount;
        uint totalFarmingTokenAmount;
        uint accRewardPerShare;
        uint totalRewardsClaimed;
        address farmAddress;
        uint farmId;
        IFarmProxy farmProxy;
        IPoolProxy poolProxy;
        IPoolPair lpToken;
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
    
    function emergencyTakeout(IERC20 _token, address _to) public onlyOwner {
        require(_token.transfer(_to,_token.balanceOf(address(this))),"error");
    }
    
    mapping (uint => CanData) public canInfo;
    mapping (uint => mapping (address => UserTokenData)) public usersInfo;
    uint public lastStackId;
    
    function createCan (
        address _farmAddress,
        uint _farmId,
        IFarmProxy _farmProxy,
        IPoolProxy _poolProxy,
        IPoolPair _lpToken,
        IERC20 _providingToken,
        IERC20 _rewardToken,
        uint _fee
    ) public onlyOwner {
        lastStackId++;
        canInfo[lastStackId] = CanData({
            totalProvidedTokenAmount: 0,
            totalFarmingTokenAmount: 0,
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
    
    function changeCanFee(uint _can_id,uint _fee) public onlyOwner {
        canInfo[_can_id].fee = _fee;
    }
    
    function updateCan (uint _can_id) public notReverted {
        CanData storage canData = canInfo[_can_id];
        uint pendingAmount = canData.farmProxy.pendingRelict(canData.farmId,address(this));
        canData.farmProxy.withdraw(canData.farmId,pendingAmount);
        canData.accRewardPerShare += pendingAmount * 1e12 / canData.totalProvidedTokenAmount;
    }

    // creates some can tokens for user in declared stack
    function mintFor(address _user, uint _can_id, uint _providedAmount) public notReverted {
        // getting user and stack info from mappings
        UserTokenData storage userTokenData = usersInfo[_can_id][_user];
        CanData storage canData = canInfo[_can_id];
        updateCan(_can_id);
        
        // get second token amount for liquidity
        address firstToken = canData.lpToken.token0();
        address secondToken = canData.lpToken.token1();
        (uint reserve0, uint reserve1,) = canData.lpToken.getReserves();
        uint reserveFirst;
        uint reserveSecond;
        if (secondToken == address(canData.providingToken)) {
            secondToken = firstToken;
            firstToken = address(canData.providingToken);
            reserveFirst = reserve1;
            reserveSecond = reserve0;
        } else {
            reserveFirst = reserve0;
            reserveSecond = reserve1;  
        }
        uint secondTokenAmount = canData.poolProxy.quote(_providedAmount,reserveFirst,reserveSecond);
        // approve tokens for liquidity
        require(IERC20(firstToken).transferFrom(_user,address(this),_providedAmount),"not enough");
        
        require(IERC20(firstToken).approve(address(canData.poolProxy),_providedAmount),"not enough");
        require(IERC20(secondToken).approve(address(canData.poolProxy),secondTokenAmount),"not enough");
        
        uint providingAmount = _providedAmount;
        // send liquidity and get lp amount
        (,,uint lpAmount) = canData.poolProxy.addLiquidity(
            firstToken,
            secondToken,
            providingAmount,
            secondTokenAmount,
            providingAmount,
            secondTokenAmount,
            address(this),
            block.number + 10
        );
        // send lp tokens to farming
        require(IERC20(address(canData.lpToken)).approve(canData.farmAddress,lpAmount),"not enough"); 
        canData.farmProxy.deposit(canData.farmId,lpAmount);
    
        // previous pending reward goes to aggregated reward
        userTokenData.aggregatedReward = lpAmount * canData.accRewardPerShare / 1e12 - userTokenData.rewardDebt;
        // incrementing provided and lp amount
        userTokenData.providedAmount += _providedAmount;
        userTokenData.farmingAmount += lpAmount;
        // updating reward reward debt
        userTokenData.rewardDebt = userTokenData.providedAmount * canData.accRewardPerShare / 1e12;
        canData.totalProvidedTokenAmount += _providedAmount;
        canData.totalFarmingTokenAmount += lpAmount;
    }
    
    
    // creates some can tokens for user in declared stack
    function burnFor(address _user, uint _can_id, uint _providedAmount, uint _rewardAmount) public notReverted {
        // getting user and stack info from mappings
        UserTokenData storage userTokenData = usersInfo[_can_id][_user];
        CanData storage canData = canInfo[_can_id];
        updateCan(_can_id);
        
        // get token adresses from pair
        address firstToken = canData.lpToken.token0();
        address secondToken = canData.lpToken.token1();
        (uint reserve0, uint reserve1,) = canData.lpToken.getReserves();
        uint reserveFirst;
        uint reserveSecond;
        if (secondToken == address(canData.providingToken)) {
            secondToken = firstToken;
            firstToken = address(canData.providingToken);
            reserveFirst = reserve1;
            reserveSecond = reserve0;
        } else {
            reserveFirst = reserve0;
            reserveSecond = reserve1;  
        }
        
        // calculate lp amount
        require(_providedAmount <= userTokenData.providedAmount, "insufficent amount");
        // aggregate rewards  and transfer
        userTokenData.aggregatedReward += userTokenData.farmingAmount * canData.accRewardPerShare / 1e12 - userTokenData.rewardDebt;
        require(_rewardAmount <= userTokenData.aggregatedReward, "insufficent amount");
        require(canData.rewardToken.transfer(_user,(_rewardAmount - canData.fee)),'lol');
        userTokenData.aggregatedReward -= _rewardAmount;
        canData.totalRewardsClaimed += _rewardAmount;
        
        uint lpAmountToTakeFromPool = canData.lpToken.balanceOf(address(this)) * reserveFirst / canData.lpToken.totalSupply();

        // prevent stack too deep
        uint providingAmount = _providedAmount;
        address user = _user;
        
        (uint amountFirst,) = canData.poolProxy.removeLiquidity(
        address(canData.providingToken),
        secondToken,
        lpAmountToTakeFromPool,
        providingAmount,
        0,
        address(this),
        block.number + 10
        );

        require(IERC20(address(canData.providingToken)).transfer(user,amountFirst),'transfer provided amount error');

        userTokenData.providedAmount -= _providedAmount;
        userTokenData.farmingAmount = userTokenData.providedAmount * canData.lpToken.totalSupply() / reserveFirst - _providedAmount;

        userTokenData.rewardDebt = userTokenData.farmingAmount * canData.accRewardPerShare / 1e12;
        
        canData.totalProvidedTokenAmount -= _providedAmount;
        canData.totalFarmingTokenAmount -= lpAmountToTakeFromPool;
    }
    
}
