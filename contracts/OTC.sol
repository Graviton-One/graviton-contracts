//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IOTC.sol";
import "hardhat/console.sol";

/// @title OTC
/// @author Anton Davydov - <fetsorn@gmail.com>
contract OTC is IOTC {
    /// @inheritdoc IOTC
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
        _;
    }

    /// @inheritdoc IOTC
    IERC20 public override base;
    /// @inheritdoc IOTC
    IERC20 public override quote;
    /// @inheritdoc IOTC
    uint256 public override price;
    /// @inheritdoc IOTC
    uint256 public override setPriceLast;
    /// @inheritdoc IOTC
    mapping (address => bool) public override canSetPrice;
    /// @inheritdoc IOTC
    uint256 public override lowerLimit;
    /// @inheritdoc IOTC
    uint256 public override upperLimit;
    /// @inheritdoc IOTC
    uint256 public override setLimitsLast;
    /// @inheritdoc IOTC
    uint256 public override cliffAdmin;
    /// @inheritdoc IOTC
    uint256 public override vestingTimeAdmin;
    /// @inheritdoc IOTC
    uint256 public override numberOfTranchesAdmin;
    /// @inheritdoc IOTC
    uint256 public override setVestingParamsLast;

    /// @inheritdoc IOTC
    mapping (address => uint256) public override startTime;
    /// @inheritdoc IOTC
    mapping (address => uint256) public override balance;
    /// @inheritdoc IOTC
    uint256 public override balanceTotal;
    /// @inheritdoc IOTC
    mapping (address => uint256) public override claimed;
    /// @inheritdoc IOTC
    uint256 public override claimedTotal;
    /// @inheritdoc IOTC
    mapping (address => uint256) public override claimLast;
    /// @inheritdoc IOTC
    mapping (address => uint256) public override cliff;
    /// @inheritdoc IOTC
    mapping (address => uint256) public override vestingTime;
    /// @inheritdoc IOTC
    mapping (address => uint256) public override numberOfTranches;

    uint256 DAY = 86400;

    constructor(
        IERC20 _base,
        IERC20 _quote,
        uint256 _price,
        uint256 _lowerLimit,
        uint256 _upperLimit,
        uint256 _cliffAdmin,
        uint256 _vestingTimeAdmin,
        uint256 _numberOfTranchesAdmin
    ) {
        owner = msg.sender;
        base = _base;
        quote = _quote;
        price = _price;
        lowerLimit = _lowerLimit;
        upperLimit = _upperLimit;
        setPriceLast = _blockTimestamp();
        setLimitsLast = _blockTimestamp();
        setVestingParamsLast = _blockTimestamp();
        canSetPrice[msg.sender] = true;
        cliffAdmin = _cliffAdmin;
        vestingTimeAdmin = _vestingTimeAdmin;
        numberOfTranchesAdmin = _numberOfTranchesAdmin;
    }

    /// @dev Returns the block timestamp. This method is overridden in tests.
    function _blockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    /// @inheritdoc IOTC
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IOTC
    function setPrice(uint256 _price) external override {
        require(_blockTimestamp()-setPriceLast > DAY, "OTC1");
        require(canSetPrice[msg.sender], "ACS");
        setPriceLast = _blockTimestamp();
        price = _price;
        emit SetPrice(_price);
    }

    /// @inheritdoc IOTC
    function setCanSetPrice(address setter, bool _canSetPrice)
        external
        override
        isOwner
    {
        canSetPrice[setter] = _canSetPrice;
        emit SetCanSetPrice(msg.sender, setter, canSetPrice[setter]);
    }

    /// @inheritdoc IOTC
    function setLimits(uint256 _lowerLimit, uint256 _upperLimit) external override isOwner {
        require(_blockTimestamp()-setLimitsLast > DAY, "OTC1");
        setLimitsLast = _blockTimestamp();
        lowerLimit = _lowerLimit;
        upperLimit = _upperLimit;
        emit SetLimits(_lowerLimit, _upperLimit);
    }

    /// @inheritdoc IOTC
    function setVestingParams(
        uint256 _cliffAdmin,
        uint256 _vestingTimeAdmin,
        uint256 _numberOfTranchesAdmin
    ) external override isOwner {
        require(_blockTimestamp()-setVestingParamsLast > DAY, "OTC1");
        setVestingParamsLast = _blockTimestamp();
        cliffAdmin = _cliffAdmin;
        vestingTimeAdmin = _vestingTimeAdmin;
        numberOfTranchesAdmin = _numberOfTranchesAdmin;
        emit SetVestingParams(_cliffAdmin, _vestingTimeAdmin, _numberOfTranchesAdmin);
    }

    /// @inheritdoc IOTC
    function exchange(uint256 amountBase) external override {
        require(balance[msg.sender] == 0, "OTC4");
        uint256 undistributed = base.balanceOf(address(this)) - (balanceTotal - claimedTotal);
        require(amountBase <= undistributed, "OTC2");
        require(lowerLimit <= amountBase && amountBase <= upperLimit, "OTC3");
        balance[msg.sender] = amountBase;
        balanceTotal += amountBase;
        uint256 amountQuote = amountBase*price/100;
        cliff[msg.sender] = cliffAdmin;
        vestingTime[msg.sender] = vestingTimeAdmin;
        numberOfTranches[msg.sender] = numberOfTranchesAdmin;
        startTime[msg.sender] = _blockTimestamp();
        quote.transferFrom(msg.sender, address(this), amountQuote);
        emit Exchange(msg.sender, amountQuote, amountBase);
    }

    /// @inheritdoc IOTC
    function claim() external override {
        uint256 interval = vestingTime[msg.sender] / numberOfTranches[msg.sender];
        require(_blockTimestamp()-startTime[msg.sender] > cliff[msg.sender], "OTC4");
        require(_blockTimestamp()-claimLast[msg.sender] > interval, "OTC5");
        uint256 intervals = ((_blockTimestamp() - startTime[msg.sender]) / interval) + 1; // +1 to claim first interval right after the cliff
        uint256 intervalsAccrued = intervals < numberOfTranches[msg.sender] ? intervals : numberOfTranches[msg.sender]; // min to cap after vesting time is over
        uint256 claimable = ((balance[msg.sender] * intervalsAccrued) / numberOfTranches[msg.sender]) - claimed[msg.sender];
        uint256 amount = claimable < balance[msg.sender] ? claimable : balance[msg.sender]; // min for leftovers
        claimed[msg.sender] += amount;
        claimedTotal += amount;
        claimLast[msg.sender] = _blockTimestamp();
        base.transfer(msg.sender, amount);
        emit Claim(msg.sender, amount);
    }

    /// @inheritdoc IOTC
    function collect() external override isOwner {
        uint256 amount = quote.balanceOf(address(this));
        quote.transfer(msg.sender, amount);
        emit Collect(amount);
    }
}
