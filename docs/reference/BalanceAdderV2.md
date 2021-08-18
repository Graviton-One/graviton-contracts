


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
0x13af4035


### totalFarms
```solidity
  function totalFarms(
  ) external returns (uint256)
```
The number of active farming campaigns

0x4c995a7f


### addFarm
```solidity
  function addFarm(
    contract IShares _share,
    contract IFarm _farm,
    uint256 _lastPortions
  ) external
```
Adds shares, farm and initialize lastPortions
for the new farming campaign

0x09ca83e4
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_share` | contract IShares | The contract that stores user shares in the farming campaign
|`_farm` | contract IFarm | The contract that calculates funds available for the farming campaign
|`_lastPortions` | uint256 | The portions processed in the farm before it was added


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
0x1a5b5a14


