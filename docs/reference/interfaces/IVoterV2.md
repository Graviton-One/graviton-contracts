Tracks voting rounds according to governance balances of users



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
Address of the contract that tracks governance balances

0xfd44f921


### canCastVotes
```solidity
  function canCastVotes(
  ) external returns (bool)
```
Look up if the account can cast votes on behalf of other users

0x081dca92


### canCheck
```solidity
  function canCheck(
  ) external returns (bool)
```
Look up if the account can check voting balances when governance balances diminish

0x7cabca66


### setCanCastVotes
```solidity
  function setCanCastVotes(
  ) external
```
Sets the permission to cast votes on behalf of other users

Can only be called by the current owner.
0x730dc1a3


### setCanCheck
```solidity
  function setCanCheck(
  ) external
```
Sets the permission to check voting balances when governance balances diminish

Can only be called by the current owner.
0x98925d30


### totalRounds
```solidity
  function totalRounds(
  ) external returns (uint256)
```
The total number of voting rounds

0x8a568299


### activeRounds
```solidity
  function activeRounds(
  ) external returns (uint256 roundId)
```
Look up the unique id of one of the active voting rounds

0x2292e3af


### finalizedRounds
```solidity
  function finalizedRounds(
  ) external returns (uint256 roundId)
```
Look up the unique id of one of the finalized voting rounds

0xf0a8297e


### roundName
```solidity
  function roundName(
  ) external returns (string)
```
Look up the name of a voting round

0x9debf9c1


### optionName
```solidity
  function optionName(
  ) external returns (string)
```
Look up the name of an option in a voting round

0xeaac697a


### votesForOption
```solidity
  function votesForOption(
  ) external returns (uint256)
```
Look up the total amount of votes for an option in a voting round

0x6e07e221


### votesInRoundByUser
```solidity
  function votesInRoundByUser(
  ) external returns (uint256)
```
Look up the amount of votes user sent in a voting round

0x4d89f980


### votesForOptionByUser
```solidity
  function votesForOptionByUser(
  ) external returns (uint256)
```
Look up the amount of votes user sent for an option in a voting round

0xe0c22e86


### userVotedInRound
```solidity
  function userVotedInRound(
  ) external returns (bool)
```
Look up if user voted in a voting round

0xb59952a2


### userVotedForOption
```solidity
  function userVotedForOption(
  ) external returns (bool)
```
Look up if user voted or an option in a voting round

0xbde9fe72


### totalUsersInRound
```solidity
  function totalUsersInRound(
  ) external returns (uint256)
```
The total number of users that voted in a voting round

0xfae67735


### totalUsersForOption
```solidity
  function totalUsersForOption(
  ) external returns (uint256)
```
The total number of users that voted for an option in a voting round

0x3abe0c6a


### votesInRound
```solidity
  function votesInRound(
  ) external returns (uint256)
```
The total number of votes in a voting round

0x1a29f1b4


### totalActiveRounds
```solidity
  function totalActiveRounds(
  ) external returns (uint256)
```
The number of active voting rounds

0xf9cce505


### totalFinalizedRounds
```solidity
  function totalFinalizedRounds(
  ) external returns (uint256)
```
The number of finalized voting rounds

0xa2e0cb2b


### totalRoundOptions
```solidity
  function totalRoundOptions(
  ) external returns (uint256)
```
The number of options in a voting round

0x67532670


### isActiveRound
```solidity
  function isActiveRound(
  ) external returns (bool)
```
Look up if a voting round is active

0x66abc2a6


### isFinalizedRound
```solidity
  function isFinalizedRound(
  ) external returns (bool)
```
Look up if a voting round is finalized

0x8c802f0c


### startRound
```solidity
  function startRound(
    string _roundName,
    string[] optionNames
  ) external
```
Starts a voting round

0xad77c86a
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_roundName` | string | voting round name, i.e. "Proposal"
|`optionNames` | string[] | an array of option names, i.e. ["Approve", "Reject"]


### finalizeRound
```solidity
  function finalizeRound(
  ) external
```
Finalized a voting round

0x3469f6e2


### castVotes
```solidity
  function castVotes(
    uint256 roundId,
    uint256 votes
  ) external
```
Records votes according to userId governance balance

Can only be called by the account allowed to cast votes on behalf of others
0xe361f07f
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`roundId` | uint256 | unique id of the voting round
|`votes` | uint256 | an array of votes for each option in a voting round, i.e. [7,12]


### castVotes
```solidity
  function castVotes(
    uint256 roundId,
    uint256[] votes
  ) external
```
Records votes according to sender's governance balance

0x44083843
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`roundId` | uint256 | unique id of the voting round
|`votes` | uint256[] | an array of votes for each option in a voting round, i.e. [7,12]


### checkVoteBalances
```solidity
  function checkVoteBalances(
  ) external
```
Decreases votes of `user` when their balance is depleted, preserving proportions

0xebce8e5a


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

### SetCanCastVotes
```solidity
  event SetCanCastVotes(
    address owner,
    address caster,
    bool newBool
  )
```
Event emitted when the `caster` permission is updated via `#setCanCastVotes`

0xfb3bc4219a56f26314da817cfc2d275075df8efc289db884e65b8d08dc8b1551
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`caster`| address | The account whose permission to cast votes was updated
|`newBool`| bool | Updated permission

### SetCanCheck
```solidity
  event SetCanCheck(
    address owner,
    address checker,
    bool newBool
  )
```
Event emitted when the `checker` permission is updated via `#setCanCheck`

0xbe36b0226217340762183bac9b95c087d57582fa89fe1f558bdcae4f01ca5c52
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`checker`| address | The account whose permission to check voting balances was updated
|`newBool`| bool | Updated permission

### StartRound
```solidity
  event StartRound(
    address owner,
    uint256 totalRounds,
    string roundName,
    string[] optionNames
  )
```
Event emitted when a voting round is started via `#startRound`

0x5e1a5715172c93eabac8e43d1d6d25a16666a54bdbe86ad319d89bcaa52f11fb
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`totalRounds`| uint256 | The total number of voting rounds after the voting round is started
|`roundName`| string | The voting round name, i.e. "Proposal"
|`optionNames`| string[] | The array of option names, i.e. ["Approve", "Reject"]

### FinalizeRound
```solidity
  event FinalizeRound(
    address owner,
    uint256 roundId
  )
```
Event emitted when a voting round is finalized via `#finalizeRound`

0x2237c4c7f7b065c0962407d5e7a8e049fb9f76823365bc367a6c276756490ed6
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`roundId`| uint256 | Unique id of the voting round

### CastVotes
```solidity
  event CastVotes(
    address caster,
    uint256 roundId,
    uint256 userId,
    uint256[] votes
  )
```
Event emitted when a user sends votes via `#castVotes`

0xb0203c31371583d54e7dd44f55f6a78e3ef2964a045dbe15ea4b47ba2a4814af
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`caster`| address | The account that cast votes
|`roundId`| uint256 | Unique id of the voting round
|`userId`| uint256 | The account that cast votes
|`votes`| uint256[] | Array of votes for each option in the round

### CheckVoteBalance
```solidity
  event CheckVoteBalance(
    address checker,
    uint256 userId,
    uint256 newBalance
  )
```
Event emitted when a `checker` decreases a voting balance preserving proportions via `#checkVoteBalances`

0xc6a27c61104a378462b1fd982971d5cc85a9d2300e9aa0636396643b54c64762
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`checker`| address | The account that checked the voting balance
|`userId`| uint256 | The account whose voting balance was checked
|`newBalance`| uint256 | The voting balance after checking

