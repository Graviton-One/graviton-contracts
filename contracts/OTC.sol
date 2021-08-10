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
    uint256 public override lowerLimit;
    /// @inheritdoc IOTC
    uint256 public override upperLimit;
    /// @inheritdoc IOTC
    uint256 public override setLimitsLast;

    /// @inheritdoc IOTC
    mapping (address => uint256) public override startTime;
    /// @inheritdoc IOTC
    mapping (address => uint256) public override balance;
    /// @inheritdoc IOTC
    uint256 public override balanceTotal;
    /// @inheritdoc IOTC
    mapping (address => uint256) public override claimed;
    /// @inheritdoc IOTC
    mapping (address => uint256) public override claimLast;

    uint256 DAY = 86400;
    uint256 MONTH = DAY*7*4;
    uint256 YEAR = DAY*365;

    constructor(
        IERC20 _base,
        IERC20 _quote,
        uint256 _price,
        uint256 _lowerLimit,
        uint256 _upperLimit
    ) {
        owner = msg.sender;
        base = _base;
        quote = _quote;
        price = _price;
        lowerLimit = _lowerLimit;
        upperLimit = _upperLimit;
        setPriceLast = _blockTimestamp();
        setLimitsLast = _blockTimestamp();
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
    function setPrice(uint256 _price) external override isOwner {
        require(_blockTimestamp()-setPriceLast > DAY, "OTC1");
        setPriceLast = _blockTimestamp();
        price = _price;
        emit SetPrice(_price);
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
    function exchange(uint256 amountBase) external override {
        require(balance[msg.sender] == 0, "OTC4");
        uint256 undistributed = base.balanceOf(address(this)) - balanceTotal;
        require(amountBase >= undistributed, "OTC2");
        require(lowerLimit <= amountBase && amountBase <= upperLimit, "OTC3");
        balance[msg.sender] = amountBase;
        uint256 amountQuote = amountBase*price/100;
        startTime[msg.sender] = _blockTimestamp();
        quote.transferFrom(msg.sender, address(this), amountQuote);
        emit Exchange(msg.sender, amountQuote, amountBase);
    }

    /// @inheritdoc IOTC
    function claim() external override {
        console.log(startTime[msg.sender]);
        console.log(claimLast[msg.sender]);
        console.log(_blockTimestamp());
        console.log(_blockTimestamp()-claimLast[msg.sender]);
        require(_blockTimestamp()-startTime[msg.sender] > DAY, "OTC4");
        require(_blockTimestamp()-claimLast[msg.sender] > MONTH, "OTC5");
        uint256 timeMonths = (_blockTimestamp() - startTime[msg.sender]) / MONTH;
        uint256 share = (100 * balance[msg.sender] * timeMonths / YEAR) / 100;
        uint256 amount = share < balance[msg.sender] ? share : balance[msg.sender];
        balance[msg.sender] -= amount;
        claimLast[msg.sender] = _blockTimestamp();
        base.transfer(msg.sender, amount);
        emit Claim(msg.sender, amount);
    }

    /// @inheritdoc IOTC
    function collect() external override isOwner {
    }
}
