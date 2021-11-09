//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IOTC.sol";

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

    uint256 public quoteDecimals;
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

    // commit hash for the revision used to deploy the contract
    string public VERSION;

    struct Deal {
        uint256 startTime;
        uint256 cliff;
        uint256 vestingTime;
        uint256 numberOfTranches;
        uint256 vested;
        uint256 claimed;
        uint256 claimLast;
    }

    mapping(address => Deal) internal deals;
    /// @inheritdoc IOTC
    uint256 public override vestedTotal;
    /// @inheritdoc IOTC
    uint256 public override claimedTotal;

    uint256 DAY = 86400;

    constructor(
        IERC20 _base,
        IERC20 _quote,
        uint256 _quoteDecimals,
        uint256 _price,
        uint256 _lowerLimit,
        uint256 _upperLimit,
        uint256 _cliffAdmin,
        uint256 _vestingTimeAdmin,
        uint256 _numberOfTranchesAdmin,
        string memory _VERSION
    ) {
        owner = msg.sender;
        base = _base;
        quote = _quote;
        quoteDecimals = _quoteDecimals;
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
        VERSION = _VERSION;
    }

    /// @inheritdoc IOTC
    function startTime(address account) external view override returns (uint256) {
        return deals[account].startTime;
    }

    /// @inheritdoc IOTC
    function cliff(address account) external view override returns (uint256) {
        return deals[account].cliff;
    }

    /// @inheritdoc IOTC
    function vestingTime(address account) external view override returns (uint256) {
        return deals[account].vestingTime;
    }

    /// @inheritdoc IOTC
    function numberOfTranches(address account) external view override returns (uint256) {
        return deals[account].numberOfTranches;
    }

    /// @inheritdoc IOTC
    function vested(address account) external view override returns (uint256) {
        return deals[account].vested;
    }

    /// @inheritdoc IOTC
    function claimed(address account) external view override returns (uint256) {
        return deals[account].claimed;
    }

    /// @inheritdoc IOTC
    function claimLast(address account) external view override returns (uint256) {
        return deals[account].claimLast;
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
        require(_blockTimestamp()-setLimitsLast > DAY, "OTC2");
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
        require(_blockTimestamp()-setVestingParamsLast > DAY, "OTC3");
        setVestingParamsLast = _blockTimestamp();
        cliffAdmin = _cliffAdmin;
        vestingTimeAdmin = _vestingTimeAdmin;
        numberOfTranchesAdmin = _numberOfTranchesAdmin;
        emit SetVestingParams(_cliffAdmin, _vestingTimeAdmin, _numberOfTranchesAdmin);
    }

    /// @inheritdoc IOTC
    function exchange(uint256 amountBase) external override {
        // assigning a struct is cheaper
        // than calling values from mapping multiple times like deals[msg.sender].vested
        Deal memory deal = deals[msg.sender];
        require(deal.vested == 0, "OTC4"); // fail if msg.sender already has an otc deal
        uint256 undistributed = base.balanceOf(address(this)) - (vestedTotal - claimedTotal);
        require(amountBase <= undistributed, "OTC5"); // fail if there is not enough gton to confirm otc deal
        require(lowerLimit <= amountBase && amountBase <= upperLimit, "OTC6"); // fail if the amount of gton is outside allowed limits
        deal.vested = amountBase;
        vestedTotal += amountBase;
        uint256 amountQuote = ((amountBase*price)/100)/(10**(18-quoteDecimals));
        require(amountQuote > 0, "OTC7"); // fail if the amount of gton is so low that no quote is paid
        deal.cliff = cliffAdmin;
        deal.vestingTime = vestingTimeAdmin;
        deal.numberOfTranches = numberOfTranchesAdmin;
        deal.startTime = _blockTimestamp();
        deals[msg.sender] = deal;
        quote.transferFrom(msg.sender, address(this), amountQuote);
        emit Exchange(msg.sender, amountQuote, amountBase);
    }

    /// @inheritdoc IOTC
    function claim() external override {
        // assigning a struct is cheaper
        // than calling values from mapping multiple times like deals[msg.sender].vested
        Deal memory deal = deals[msg.sender];
        uint256 interval = deal.vestingTime / deal.numberOfTranches;
        require(_blockTimestamp()-deal.startTime > deal.cliff, "OTC8"); // fail if claim is made before the cliff ends
        require(_blockTimestamp()-deal.claimLast > interval, "OTC9"); // fail if not enough time has passed since last claim
        uint256 intervals = ((_blockTimestamp() - deal.startTime) / interval) + 1; // +1 to claim first interval right after the cliff
        uint256 intervalsAccrued = intervals < deal.numberOfTranches ? intervals : deal.numberOfTranches; // min to cap after vesting time is over
        uint256 amount = ((deal.vested * intervalsAccrued) / deal.numberOfTranches) - deal.claimed;
        deal.claimed += amount;
        claimedTotal += amount;
        deal.claimLast = _blockTimestamp();
        deals[msg.sender] = deal;
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
