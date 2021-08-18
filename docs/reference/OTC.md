


## Functions
### constructor
```solidity
  function constructor(
  ) public
```




### startTime
```solidity
  function startTime(
  ) external returns (uint256)
```
beginning of vesting period for `account`



### cliff
```solidity
  function cliff(
  ) external returns (uint256)
```
claim starting time set for otc deal with `account`



### vestingTime
```solidity
  function vestingTime(
  ) external returns (uint256)
```
total vesting period set for otc deal with `account`



### numberOfTranches
```solidity
  function numberOfTranches(
  ) external returns (uint256)
```
number of claims over vesting period set for otc deal with `account`



### vested
```solidity
  function vested(
  ) external returns (uint256)
```
amount of GTON vested for `account`



### claimed
```solidity
  function claimed(
  ) external returns (uint256)
```
amount of GTON claimed by `account`



### claimLast
```solidity
  function claimLast(
  ) external returns (uint256)
```
last time GTON was claimed by `account`



### _blockTimestamp
```solidity
  function _blockTimestamp(
  ) internal returns (uint256)
```

Returns the block timestamp. This method is overridden in tests.


### setOwner
```solidity
  function setOwner(
  ) external
```
Transfers ownership of the contract to a new account (`_owner`).

Can only be called by the current owner.


### setPrice
```solidity
  function setPrice(
  ) external
```
updates price



### setCanSetPrice
```solidity
  function setCanSetPrice(
  ) external
```
Sets `setter` permission to open new governance balances to `_canSetPrice`

Can only be called by the current owner.


### setLimits
```solidity
  function setLimits(
  ) external
```
updates exchange limits



### setVestingParams
```solidity
  function setVestingParams(
    uint256 _cliff,
    uint256 _vestingTimeAdmin,
    uint256 _numberOfTranchesAdmin
  ) external
```
updates vesting parameters


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_cliff` | uint256 | claim starting time
|`_vestingTimeAdmin` | uint256 | total vesting period
|`_numberOfTranchesAdmin` | uint256 | number of claims over vesting period

### exchange
```solidity
  function exchange(
    uint256 amount
  ) external
```
exchanges quote tokens for vested GTON according to a set price


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`amount` | uint256 | amount of GTON to exchange

### claim
```solidity
  function claim(
  ) external
```
transfers a share of vested GTON to the caller



### collect
```solidity
  function collect(
  ) external
```
transfers quote tokens to the owner



