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
  ) external returns (address)
```
Address of the contract that tracks governance balances



### canCheck
```solidity
  function canCheck(
  ) external returns (bool)
```
Look up if `user` can check voting balances when governance balances diminish



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



### roundOptions
```solidity
  function roundOptions(
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
    string name,
    string[] options
  ) external
```
Starts a voting round


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`name` | string | voting round name, i.e. "Proposal"
|`options` | string[] | an array of option names, i.e. ["Approve", "Reject"]

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



