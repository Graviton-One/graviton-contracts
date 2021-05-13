pragma solidity >=0.8.0;

interface IERC20 {
    function mint(address _to, uint256 _value) external;
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
    function transfer(address _to, uint _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint _value) external returns (bool success);
    function balanceOf(address _owner) external view returns (uint balance);
}

interface ImpactKeeper {
    // is used by the users to claim, also highly recomended to call mint function of farm contract
    function claim() external;
    // this function creates an airdrop of amounts available to claim in the contract
    // used as a method to prevent scaming claim share, costs a lot of gas
    function processPendingAmounts() external;
}

interface NewContract {
    function setImpact(address user, uint256 impact) external;
    function setPendings(address user, uint256 amount) external;
    function setTotalSupply(uint256 supply) external;
}

abstract contract DepositersImpact is ImpactKeeper {
    event Transfer(address token, address user, uint256 value, uint256 id, uint256 action);

    // priveleged adresses
    address public owner;
    address public nebula;

    // total locked usd amount
    uint public totalSupply;
    // tokens that are allowed to be processed
    mapping(address => bool) public allowedTokens;

    // users impact and amounts
    mapping (address => uint) public impact;
    mapping (address => uint) public pendingAmounts;
    // for token airdrop
    mapping (uint => address) public users;
    uint public userCount;
    // balance pools
    uint public currentBP;
    uint public lastBP;
    uint public lastEmissionProcessed;

    // for processing mass transfers
    uint public final_value;

    // for migration
    uint private last;
    bool private notDeprecated = true;

    bool public claimAllowance;

    // contract addresses
    address public governanceTokenAddr;
    address public farmAddr;

    // processed data array
    mapping (uint => bool) public dataId;


    constructor(address _owner, address _nebula, address[] memory _allowedTokens, address _governanceTokenAddr, address _farmAddr) {
        for (uint i = 0; i < _allowedTokens.length; i++){
            allowedTokens[_allowedTokens[i]] = true;
        }
        governanceTokenAddr = _governanceTokenAddr;
        farmAddr = _farmAddr;
        owner = _owner;
        nebula = _nebula;
        claimAllowance = false;
    }

    // farm transfer
    function setClaimingAllowance(bool _claimAllowance) public isOwner {
        claimAllowance = _claimAllowance;
    }

    // farm transfer
    function transferFarm(address newFarmAddr) public isOwner {
        farmAddr = newFarmAddr;
    }

    // owner control functions
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function transferOwnership(address newOwnerAddress) public isOwner {
        owner = newOwnerAddress;
    }

    function setNewGtonAddr(address newGtonAddress) public isOwner {
        governanceTokenAddr = newGtonAddress;
    }

    // nebula control functions
    modifier isNebula() {
        require(msg.sender == nebula, "Caller is not nebula");
        _;
    }

    function transferNebula(address newNebulaAddress) public isOwner {
        nebula = newNebulaAddress;
    }

    function processPendingAmounts() public override {
        require(notDeprecated, "This contract is outdated.");
        IERC20 token = IERC20(governanceTokenAddr);
        uint to_value = final_value + 2000;
        if (final_value == 0) {
            currentBP = token.balanceOf(address(this)) - lastBP;
            lastEmissionProcessed = currentBP;
        }
        uint from_value = final_value;
        if (to_value > userCount){
            to_value = userCount;
        }
        if (final_value == 0) {
            uint amount = token.allowance(farmAddr,address(this));
            require(token.transferFrom(farmAddr,address(this),amount),"error transferring from farm");
        }
        for(uint i = from_value; i < to_value; i++) {
            address userAddress = users[i];
            uint amount = currentBP * impact[userAddress] / totalSupply;
            pendingAmounts[userAddress] += amount;
            lastBP += amount;
        }
        if (to_value == userCount) {
            final_value = 0;
        } else {
            final_value = to_value;
        }
    }

    // impact interface implement
    function claim() public override {
        require(claimAllowance,"claim is shut down by the owner");
        IERC20(governanceTokenAddr).transfer(msg.sender,pendingAmounts[msg.sender]);
        lastBP -= pendingAmounts[msg.sender];
        pendingAmounts[msg.sender] = 0;

    }

    // nebula methods
    function addNewToken(address newTokenAddress) public isOwner {
        allowedTokens[newTokenAddress] = true;
    }

    function removeToken(address newTokenAddress) public isOwner {
        allowedTokens[newTokenAddress] = false;
    }

    function getPendingAmount(address usr) public view returns (uint) {
        return pendingAmounts[usr];
    }

    function deserializeUint(bytes memory b, uint startPos, uint len) external pure returns (uint) {
        uint v = 0;
        for (uint p = startPos; p < startPos + len; p++) {
            v = v * 256 + uint(uint8(b[p]));
        }
        return v;
    }

    function deserializeAddress(bytes memory b, uint startPos) external view returns (address) {
        return address(uint160(this.deserializeUint(b, startPos, 20)));
    }

    function migrate(address newAddress) public isOwner {
        NewContract newContract = NewContract(newAddress);
        uint to_value = last + 2000;
        uint from_value = last;
        if (to_value > userCount){
            to_value = userCount;
        }
        for(uint i = from_value; i < to_value; i++) {
            address user = users[i];
            uint pendAmount = getPendingAmount(user);
            uint impactAmount = impact[user];
            newContract.setPendings(user, pendAmount);
            newContract.setImpact(user, impactAmount);
        }
        if (to_value == userCount) {
            last = 0;
            notDeprecated = false;
        } else {
            last = to_value;
        }
    }

    // called from gravity to add impact to users
    function attachValue(bytes calldata impactData) external virtual;
}
