


## Functions
### wallet
```solidity
  function wallet(
  ) external returns (address)
```
Address that holds relay tokens



### setWallet
```solidity
  function setWallet(
  ) external
```
Sets the address that holds relay tokens



### gton
```solidity
  function gton(
  ) external returns (contract IERC20)
```
relay token



### wnative
```solidity
  function wnative(
  ) external returns (contract IWETH)
```
ERC20 wrapped version of the native token



### router
```solidity
  function router(
  ) external returns (contract IUniswapV2Router01)
```
UniswapV2 router



### relayTopic
```solidity
  function relayTopic(
  ) external returns (bytes32)
```
topic0 of the event associated with initiating a relay transfer



### setRelayTopic
```solidity
  function setRelayTopic(
  ) external
```
Sets topic0 of the event associated with initiating a relay transfer



## Events
### DeliverRelay
```solidity
  event DeliverRelay(
  )
```
Event emitted when the relay tokens are traded for
`amount` of native tokens and are sent to the `user` via '#routeValue'


### SetRelayTopic
```solidity
  event SetRelayTopic(
    bytes32 topicOld,
    bytes32 topicNew
  )
```
Event emitted when the RelayTopic is set via '#setRelayTopic'


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
Event emitted when the wallet is set via '#setWallet'


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`walletOld`| address | The previous wallet address
|`walletNew`| address | The new wallet address
