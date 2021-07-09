


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


### roundName
```solidity
  function roundName(
  ) external returns (string)
```
Look up the name of a voting round
getter functions with parameter names



### optionName
```solidity
  function optionName(
  ) external returns (string)
```
Look up the name of an option in a voting round



### totalRoundOptions
```solidity
  function totalRoundOptions(
  ) external returns (uint256)
```
The number of options in a voting round



### votesForOptionByUser
```solidity
  function votesForOptionByUser(
  ) public returns (uint256)
```
Look up the amount of votes user sent for an option in a voting round



### votesInRoundByUser
```solidity
  function votesInRoundByUser(
  ) public returns (uint256)
```
Look up the amount of votes user sent in a voting round



### userVotedInRound
```solidity
  function userVotedInRound(
  ) public returns (bool)
```
Look up if user voted in a voting round



### userVotedForOption
```solidity
  function userVotedForOption(
  ) public returns (bool)
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



### votesForOption
```solidity
  function votesForOption(
  ) public returns (uint256)
```
Look up the total amount of votes for an option in a voting round



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



### isActiveRound
```solidity
  function isActiveRound(
  ) public returns (bool)
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
Records votes according to userId governance balance

Can only be called by the account allowed to cast votes on behalf of others
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`roundId` | uint256 | unique id of the voting round
|`votes` | uint256[] | an array of votes for each option in a voting round, i.e. [7,12]


### _castVotes
```solidity
  function _castVotes(
  ) internal
```




### checkVoteBalance
```solidity
  function checkVoteBalance(
  ) internal
```




### checkVoteBalances
```solidity
  function checkVoteBalances(
  ) external
```
Decreases votes of `user` when their balance is depleted, preserving proportions



