BalanceAdder adds governance balance to users according to farming campaigns



## Functions
### owner
```solidity
  function owner(
  ) external returns (address)
```
User that can grant access permissions and perform privileged actions

0x8da5cb5b


### setOwner
```solidity
  function setOwner(
  ) external
```
Transfers ownership of the contract to a new account (`_owner`).

Can only be called by the current owner.
0x13af4035


### balanceKeeper
```solidity
  function balanceKeeper(
  ) external returns (contract IBalanceKeeperV2)
```
Contract that stores governance balance of users

0xfd44f921


### shares
```solidity
  function shares(
  ) external returns (contract IShares)
```
Look up the contract that stores user shares in the `farmIndex` farming campaign

0x57a858fc


### farms
```solidity
  function farms(
  ) external returns (contract IFarm)
```
Look up the contract that calculates funds available for the `farmIndex` farming campaign

0x7da470ea


### lastPortions
```solidity
  function lastPortions(
  ) external returns (uint256)
```
Look up the amount of funds already distributed for the `farmIndex` farming campaign

0x2a433aae


### currentUser
```solidity
  function currentUser(
  ) external returns (uint256)
```
Id of the user to receive funds in the current farming campaign

When current user is 0, campaign has not started processing
When processing is finished, current user is set to 0
0x92ee0334


### currentFarm
```solidity
  function currentFarm(
  ) external returns (uint256)
```
Id of the farming campaign to process

0x7a42a865


### currentPortion
```solidity
  function currentPortion(
  ) external returns (uint256)
```
Portion of funds to distribute in processing on this round

0x12ccc301


### totalUnlocked
```solidity
  function totalUnlocked(
  ) external returns (uint256)
```
Total funds available for the farming campaign

0xa779d080


### totalShares
```solidity
  function totalShares(
  ) external returns (uint256)
```
The sum of shares of all users

0x3a98ef39


### isProcessing
```solidity
  function isProcessing(
  ) external returns (bool)
```
Look up if the `farmIndex` farming campaign is being processed

0x5b0342f1

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

0x4c995a7f


### totalUsers
```solidity
  function totalUsers(
  ) external returns (uint256)
```
The number of users known to BalanceKeeper

0xbff1f9e1


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

changes ids of farms that follow `farmIndex` in the array
0x42a7579d


### processBalances
```solidity
  function processBalances(
  ) external
```
Adds balances to `step` of users according to current farming campaign

iterates over all users and then increments current farm index
0x1a5b5a14


## Events
### SetOwner
```solidity
  event SetOwner(
    address ownerOld,
    address ownerNew
  )
```
Event emitted when the owner changes via `#setOwner`.

0xcbf985117192c8f614a58aaf97226bb80a754772f5f6edf06f87c675f2e6c663
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`ownerOld`| address | The account that was the previous owner of the contract
|`ownerNew`| address | The account that became the owner of the contract

### AddFarm
```solidity
  event AddFarm(
    uint256 _shares,
    contract IShares _farm,
    contract IFarm _lastPortions
  )
```
Event emitted when a farm is added via `#addFarm`

0xc4c7aeb041ac2d1bd75b368a05edc2ea5f1b222e050bbbe91c735d074d8583f8
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_shares`| uint256 | The contract that stores user shares in the farming campaign
|`_farm`| contract IShares | The contract that calculates funds available for the farming campaign
|`_lastPortions`| contract IFarm | The portions processed in the farm before it was added

### RemoveFarm
```solidity
  event RemoveFarm(
    uint256 oldShares,
    contract IShares oldFarm,
    contract IFarm oldLastPortions
  )
```
Event emitted when a farm is removed via `#removeFarm`

0x084f61398b65df2c019793a91ca836dafcd56ac22adf2cc501c98e44665457da
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

0x58daf0f3614604151fd17c5915e68241308b3404ac4c96a3af636acd06b3e4df
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

0x67da84f1d8d6e06e895499674121e08e062f1f9ff352d9913338ad9b6c30a47a
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`oldShares`| uint256 | The contract that stores user shares in the farming campaign
|`oldFarm`| contract IShares | The contract that calculates funds available for the farming campaign
|`userId`| contract IFarm | unique id of the user
|`amount`| uint256 | The amount of governance tokens added to user's governance balance

