BalanceAdder adds governance balance to users according to farming campaigns



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


### balanceKeeper
```solidity
  function balanceKeeper(
  ) external returns (contract IBalanceKeeperV2)
```
Contract that stores governance balance of users



### shares
```solidity
  function shares(
  ) external returns (contract IShares)
```
Look up the contract that stores user shares in the `farmIndex` farming campaign



### farms
```solidity
  function farms(
  ) external returns (contract IFarm)
```
Look up the contract that calculates funds available for the `farmIndex` farming campaign



### lastPortions
```solidity
  function lastPortions(
  ) external returns (uint256)
```
Look up the amount of funds already distributed for the `farmIndex` farming campaign



### currentUser
```solidity
  function currentUser(
  ) external returns (uint256)
```
Id of the user to receive funds in the current farming campaign

When current user is 0, campaign has not started processing
When processing is finished, current user is set to 0


### currentFarm
```solidity
  function currentFarm(
  ) external returns (uint256)
```
Id of the farming campaign to process



### currentPortion
```solidity
  function currentPortion(
  ) external returns (uint256)
```
Portion of funds to distribute in processing on this round



### totalUnlocked
```solidity
  function totalUnlocked(
  ) external returns (uint256)
```
Total funds available for the farming campaign



### totalShares
```solidity
  function totalShares(
  ) external returns (uint256)
```
The sum of shares of all users



### isProcessing
```solidity
  function isProcessing(
  ) external returns (bool)
```
Look up if the `farmIndex` farming campaign is being processed



#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`true`| uint256 | if the farming campaign is locked for processing,
false if the current farm has not started processing
### totalFarms
```solidity
  function totalFarms(
  ) external returns (uint256)
```
The number of active farming campaigns



### totalUsers
```solidity
  function totalUsers(
  ) external returns (uint256)
```
The number of users known to BalanceKeeper



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

changes ids of farms that follow `farmIndex` in the array


### processBalances
```solidity
  function processBalances(
  ) external
```
Adds balances to `step` of users according to current farming campaign

iterates over all users and then increments current farm index


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
### AddFarm
```solidity
  event AddFarm(
    uint256 _shares,
    contract IShares _farm
  )
```
Event emitted when a farm is added via `#addFarm`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_shares`| uint256 | The contract that stores user shares in the farming campaign
|`_farm`| contract IShares | The contract that calculates funds available for the farming campaign
### RemoveFarm
```solidity
  event RemoveFarm(
    uint256 oldShares,
    contract IShares oldFarm,
    contract IFarm oldLastPortions
  )
```
Event emitted when a farm is removed via `#removeFarm`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`oldShares`| uint256 | The contract that stores user shares in the farming campaign
|`oldFarm`| contract IShares | The contract that calculates funds available for the farming campaign
|`oldLastPortions`| contract IFarm | The portions processed in the farm before it was removed
### ProcessBalances
```solidity
  event ProcessBalances(
    uint256 oldShares,
    contract IShares oldFarm,
    contract IFarm step
  )
```
Event emitted when balances are processed for a farm via `#processBalances`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`oldShares`| uint256 | The contract that stores user shares in the farming campaign
|`oldFarm`| contract IShares | The contract that calculates funds available for the farming campaign
|`step`| contract IFarm | Number of users to process
### ProcessBalance
```solidity
  event ProcessBalance(
    uint256 oldShares,
    contract IShares oldFarm,
    contract IFarm userId,
    uint256 amount
  )
```
Event emitted when balances are processed for a farm via `#processBalances`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`oldShares`| uint256 | The contract that stores user shares in the farming campaign
|`oldFarm`| contract IShares | The contract that calculates funds available for the farming campaign
|`userId`| contract IFarm | unique id of the user
|`amount`| uint256 | The amount of governance tokens added to user's governance balance
