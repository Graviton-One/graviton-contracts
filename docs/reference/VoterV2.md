


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

0xeaac697a


### totalRoundOptions
```solidity
  function totalRoundOptions(
  ) external returns (uint256)
```
The number of options in a voting round

0x67532670


### votesForOptionByUser
```solidity
  function votesForOptionByUser(
  ) public returns (uint256)
```
Look up the amount of votes user sent for an option in a voting round

0xe0c22e86


### votesInRoundByUser
```solidity
  function votesInRoundByUser(
  ) public returns (uint256)
```
Look up the amount of votes user sent in a voting round

0x4d89f980


### userVotedInRound
```solidity
  function userVotedInRound(
  ) public returns (bool)
```
Look up if user voted in a voting round

0xb59952a2


### userVotedForOption
```solidity
  function userVotedForOption(
  ) public returns (bool)
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


### votesForOption
```solidity
  function votesForOption(
  ) public returns (uint256)
```
Look up the total amount of votes for an option in a voting round

0x6e07e221


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


### isActiveRound
```solidity
  function isActiveRound(
  ) public returns (bool)
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
Records votes according to userId governance balance

Can only be called by the account allowed to cast votes on behalf of others
0xe361f07f
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

0xebce8e5a


