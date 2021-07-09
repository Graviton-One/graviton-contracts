Tracks shares of early birds



## Functions
### balanceKeeper
```solidity
  function balanceKeeper(
  ) external returns (contract IBalanceKeeperV2)
```
Address of the contract that tracks governance balances



### impactEB
```solidity
  function impactEB(
  ) external returns (contract IImpactKeeper)
```
Address of the contract that tracks early birds impact



### impactById
```solidity
  function impactById(
  ) external returns (uint256)
```
Look up early birds share of `userId`



### totalSupply
```solidity
  function totalSupply(
  ) external returns (uint256)
```
The total amount of early birds shares



### currentUser
```solidity
  function currentUser(
  ) external returns (uint256)
```
Index of the user to migrate early birds impact



### migrate
```solidity
  function migrate(
  ) external
```
Copies impact data for `step` users from the previous early birds contract



## Events
### Migrate
```solidity
  event Migrate(
    address user,
    uint256 userId,
    uint256 impact
  )
```
Event emitted when data is routed


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`user`| address | Address of the user whose impact was migrated
|`userId`| uint256 | Unique id of the user whose impact was migrated
|`impact`| uint256 | The amount of stable coins the user deposited in the early birds campaign
