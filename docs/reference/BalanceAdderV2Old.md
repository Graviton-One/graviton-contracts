


## Functions
### constructor
```solidity
  function constructor(
  ) public
```




### setOwner
```solidity
  function setOwner(
  ) external
```
Transfers ownership of the contract to a new account (`_owner`).

Can only be called by the current owner.


### totalFarms
```solidity
  function totalFarms(
  ) external returns (uint256)
```
The number of active farming campaigns



### addFarm
```solidity
  function addFarm(
    contract IShares _share,
    contract IFarm _farm
  ) external
```
Adds shares, farm and initialize lastPortions
for the new farming campaign


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_share` | contract IShares | The contract that stores user shares in the farming campaign
|`_farm` | contract IFarm | The contract that calculates funds available for the farming campaign

### removeFarm
```solidity
  function removeFarm(
  ) external
```
Removes shares, farm and lastPortions for the new farming campaign

remove index from arrays


### processBalances
```solidity
  function processBalances(
  ) external
```
Adds balances to `step` of users according to current farming campaign

iterates over all users and then increments current farm index


