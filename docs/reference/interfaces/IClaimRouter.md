Forwards data about crosschain locking/unlocking events to balance keepers



## Functions
### balanceKeeper
```solidity
  function balanceKeeper(
  ) external returns (contract IBalanceKeeperV2)
```
Address of the contract that tracks governance balances



### requestClaimTopic
```solidity
  function requestClaimTopic(
  ) external returns (bytes32)
```
TODO



### setRequestClaimTopic
```solidity
  function setRequestClaimTopic(
  ) external
```
TODO



## Events
### SetRequestClaimTopic
```solidity
  event SetRequestClaimTopic(
    bytes32 topicOld,
    bytes32 topicNew
  )
```
TODO


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`topicOld`| bytes32 | The previous topic
|`topicNew`| bytes32 | The new topic
### ClaimBSC
```solidity
  event ClaimBSC(
  )
```
TODO


### ClaimPLG
```solidity
  event ClaimPLG(
  )
```
TODO


### ClaimETH
```solidity
  event ClaimETH(
  )
```
TODO


