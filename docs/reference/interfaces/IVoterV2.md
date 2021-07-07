Tracks voting rounds according to governance balances of users



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
Address of the contract that tracks governance balances



### canCastVotes
```solidity
  function canCastVotes(
  ) external returns (bool)
```
Look up if the account can cast votes on behalf of other users



### canCheck
```solidity
  function canCheck(
  ) external returns (bool)
```
Look up if the account can check voting balances when governance balances diminish



### setCanCastVotes
```solidity
  function setCanCastVotes(
  ) external
```
Sets the permission to cast votes on behalf of other users

Can only be called by the current owner.


### setCanCheck
```solidity
  function setCanCheck(
  ) external
```
Sets the permission to check voting balances when governance balances diminish

Can only be called by the current owner.


### totalRounds
```solidity
  function totalRounds(
  ) external returns (uint256)
```
The total number of voting rounds



### activeRounds
```solidity
  function activeRounds(
  ) external returns (uint256 roundId)
```
Look up the unique id of one of the active voting rounds



### finalizedRounds
```solidity
  function finalizedRounds(
  ) external returns (uint256 roundId)
```
Look up the unique id of one of the finalized voting rounds



### roundName
```solidity
  function roundName(
  ) external returns (string)
```
Look up the name of a voting round



### optionName
```solidity
  function optionName(
  ) external returns (string)
```
Look up the name of an option in a voting round



### votesForOption
```solidity
  function votesForOption(
  ) external returns (uint256)
```
Look up the total amount of votes for an option in a voting round



### votesInRoundByUser
```solidity
  function votesInRoundByUser(
  ) external returns (uint256)
```
Look up the amount of votes user sent in a voting round



### votesForOptionByUser
```solidity
  function votesForOptionByUser(
  ) external returns (uint256)
```
Look up the amount of votes user sent for an option in a voting round



### userVotedInRound
```solidity
  function userVotedInRound(
  ) external returns (bool)
```
Look up if user voted in a voting round



### userVotedForOption
```solidity
  function userVotedForOption(
  ) external returns (bool)
```
Look up if user voted or an option in a voting round



### totalUsersInRound
```solidity
  function totalUsersInRound(
  ) external returns (uint256)
```
The total number of users that voted in a voting round



### totalUsersForOption
```solidity
  function totalUsersForOption(
  ) external returns (uint256)
```
The total number of users that voted for an option in a voting round



### votesInRound
```solidity
  function votesInRound(
  ) external returns (uint256)
```
The total number of votes in a voting round



### totalActiveRounds
```solidity
  function totalActiveRounds(
  ) external returns (uint256)
```
The number of active voting rounds



### totalFinalizedRounds
```solidity
  function totalFinalizedRounds(
  ) external returns (uint256)
```
The number of finalized voting rounds



### totalRoundOptions
```solidity
  function totalRoundOptions(
  ) external returns (uint256)
```
The number of options in a voting round



### isActiveRound
```solidity
  function isActiveRound(
  ) external returns (bool)
```
Look up if a voting round is active



### isFinalizedRound
```solidity
  function isFinalizedRound(
  ) external returns (bool)
```
Look up if a voting round is finalized



### startRound
```solidity
  function startRound(
    string _roundName,
    string[] optionNames
  ) external
```
Starts a voting round


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



### castVotes
```solidity
  function castVotes(
    uint256 roundId,
    uint256 votes
  ) external
```
Records votes according to userId governance balance

Can only be called by the account allowed to cast votes on behalf of others
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
### SetCanCastVotes
```solidity
  event SetCanCastVotes(
    address owner,
    address caster,
    bool newBool
  )
```
Event emitted when the `caster` permission is updated via `#setCanCastVotes`


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


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`checker`| address | The account that checked the voting balance
|`userId`| uint256 | The account whose voting balance was checked
|`newBalance`| uint256 | The voting balance after checking
