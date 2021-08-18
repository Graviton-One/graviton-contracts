Exchanges ERC20 token for GTON with a linear unlocking schedule



## Functions
### owner
```solidity
  function owner(
  ) external returns (address)
```
User that can grant access permissions and perform privileged actions



### setOwner
```solidity
  function setOwner(
  ) external
```
Transfers ownership of the contract to a new account (`_owner`).

Can only be called by the current owner.


### base
```solidity
  function base(
  ) external returns (contract IERC20)
```
Address of GTON



### quote
```solidity
  function quote(
  ) external returns (contract IERC20)
```
Address of ERC20 token to sell GTON for



### price
```solidity
  function price(
  ) external returns (uint256)
```
amount of quote tokens needed to receive one GTON



### setPriceLast
```solidity
  function setPriceLast(
  ) external returns (uint256)
```
last time price was updated



### setPrice
```solidity
  function setPrice(
  ) external
```
updates price



### canSetPrice
```solidity
  function canSetPrice(
  ) external returns (bool)
```
Look up if `user` is allowed to set price



### setCanSetPrice
```solidity
  function setCanSetPrice(
  ) external
```
Sets `setter` permission to open new governance balances to `_canSetPrice`

Can only be called by the current owner.


### lowerLimit
```solidity
  function lowerLimit(
  ) external returns (uint256)
```
Minimum amount of GTON to exchange



### upperLimit
```solidity
  function upperLimit(
  ) external returns (uint256)
```
Maximum amount of GTON to exchange



### setLimitsLast
```solidity
  function setLimitsLast(
  ) external returns (uint256)
```
last time limits were updated



### setLimits
```solidity
  function setLimits(
  ) external
```
updates exchange limits



### cliffAdmin
```solidity
  function cliffAdmin(
  ) external returns (uint256)
```
claim starting time to set for otc deals



### vestingTimeAdmin
```solidity
  function vestingTimeAdmin(
  ) external returns (uint256)
```
total vesting period to set for otc deals



### numberOfTranchesAdmin
```solidity
  function numberOfTranchesAdmin(
  ) external returns (uint256)
```
number of claims over vesting period to set for otc deals



### setVestingParamsLast
```solidity
  function setVestingParamsLast(
  ) external returns (uint256)
```
last time vesting parameters were updated



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



### vestedTotal
```solidity
  function vestedTotal(
  ) external returns (uint256)
```
total amount of vested GTON



### claimedTotal
```solidity
  function claimedTotal(
  ) external returns (uint256)
```
amount of GTON claimed by all accounts



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



## Events
### SetOwner
```solidity
  event SetOwner(
    address ownerOld,
    address ownerNew
  )
```
Event emitted when the owner changes via `#setOwner`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`ownerOld`| address | The account that was the previous owner of the contract
|`ownerNew`| address | The account that became the owner of the contract
### SetPrice
```solidity
  event SetPrice(
    uint256 _price
  )
```
Event emitted when the owner updates the price via `#setPrice`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_price`| uint256 | amount of quote tokens needed to receive one GTON
### SetCanSetPrice
```solidity
  event SetCanSetPrice(
    address owner,
    address setter,
    bool newBool
  )
```
Event emitted when the `setter` permission is updated via `#setCanSetPrice`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`setter`| address | The account whose permission to set price was updated
|`newBool`| bool | Updated permission
### SetLimits
```solidity
  event SetLimits(
    uint256 _lowerLimit,
    uint256 _upperLimit
  )
```
Event emitted when the owner updates exchange limits via `#setLimits`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_lowerLimit`| uint256 | minimum amount of GTON to exchange
|`_upperLimit`| uint256 | maximum amount of GTON to exchange
### SetVestingParams
```solidity
  event SetVestingParams(
    uint256 _cliffAdmin,
    uint256 _vestingTimeAdmin,
    uint256 _numberOfTranchesAdmin
  )
```
Event emitted when the owner updates vesting parameters via `#setVestingParams`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_cliffAdmin`| uint256 | claim starting time to set for otc deals
|`_vestingTimeAdmin`| uint256 | total vesting period to set for otc deals
|`_numberOfTranchesAdmin`| uint256 | number of tranches to set for otc deals
### Exchange
```solidity
  event Exchange(
    address account,
    uint256 amountQuote,
    uint256 amountBase
  )
```
Event emitted when OTC exchange is initiated via `#exchange`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`account`| address | account that initiated the exchange
|`amountQuote`| uint256 | amount of quote tokens that `account`
transfers to the contract
|`amountBase`| uint256 | amount of GTON vested for `account`
in exchange for quote tokens
### Claim
```solidity
  event Claim(
    address account,
    uint256 amount
  )
```
Event emitted when an account claims vested GTON via `#Claim`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`account`| address | account that initiates OTC exchange
|`amount`| uint256 | amount of base tokens that the account claims
### Collect
```solidity
  event Collect(
    uint256 amount
  )
```
Event emitted when the owner collects quote tokens via `#Collect`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`amount`| uint256 | amount of quote tokens that the owner collects
