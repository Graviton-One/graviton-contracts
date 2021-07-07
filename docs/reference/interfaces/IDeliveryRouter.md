Forwards data about crosschain locking/unlocking events to balance keepers



## Functions
### governanceToken
```solidity
  function governanceToken(
  ) external returns (contract IERC20)
```
TODO



### wallet
```solidity
  function wallet(
  ) external returns (address)
```
TODO



### setWallet
```solidity
  function setWallet(
  ) external
```
TODO



### confirmClaimTopic
```solidity
  function confirmClaimTopic(
  ) external returns (bytes32)
```
Look up topic0 of the event associated with adding governance tokens



### setConfirmClaimTopic
```solidity
  function setConfirmClaimTopic(
  ) external
```
Sets topic0 of the event associated with claiming governance topics



## Events
### SetConfirmClaimTopic
```solidity
  event SetConfirmClaimTopic(
    bytes32 topicOld,
    bytes32 topicNew
  )
```
Event emitted when the ConfirmClaimTopic is set via '#setConfirmClaimTopic'


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`topicOld`| bytes32 | The previous topic
|`topicNew`| bytes32 | The new topic
### SetWallet
```solidity
  event SetWallet(
    address walletOld,
    address walletNew
  )
```
Event emitted when the wallet changes via `#setWallet`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`walletOld`| address | The previous wallet
|`walletNew`| address | The new wallet
### DeliverClaim
```solidity
  event DeliverClaim(
  )
```
TODO


