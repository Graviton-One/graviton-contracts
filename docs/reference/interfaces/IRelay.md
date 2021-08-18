Trades native tokens for gton to start crosschain swap,
trades gton for native tokens to compelete crosschain swap



## Functions
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



### gton
```solidity
  function gton(
  ) external returns (contract IERC20)
```
relay token



### isAllowedChain
```solidity
  function isAllowedChain(
  ) external returns (bool)
```
chains for relay swaps to and from



### setIsAllowedChain
```solidity
  function setIsAllowedChain(
    string chain,
    bool newBool
  ) external
```
allow/forbid chain to relay swap


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`chain` | string | blockchain name, e.g. 'FTM', 'PLG'
|`newBool` | bool | new permission for the chain

### feeMin
```solidity
  function feeMin(
  ) external returns (uint256)
```
minimum fee for a destination



### feePercent
```solidity
  function feePercent(
  ) external returns (uint256)
```
percentage fee for a destination



### setFees
```solidity
  function setFees(
    string _feeMin,
    uint256 _feePercent
  ) external
```
Sets fees for a destination


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_feeMin` | string | Minimum fee
|`_feePercent` | uint256 | Percentage fee

### lowerLimit
```solidity
  function lowerLimit(
  ) external returns (uint256)
```
minimum amount of native tokens allowed to swap



### upperLimit
```solidity
  function upperLimit(
  ) external returns (uint256)
```
maximum amount of native tokens allowed to swap



### setLimits
```solidity
  function setLimits(
    string _lowerLimit,
    uint256 _upperLimit
  ) external
```
Sets limits for a destination


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_lowerLimit` | string | Minimum amount of native tokens allowed to swap
|`_upperLimit` | uint256 | Maximum amount of native tokens allowed to swap

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



### lock
```solidity
  function lock(
    string destination,
    bytes receiver
  ) external
```
Trades native tokens for relay, takes fees,
emits event to start crosschain transfer


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`destination` | string | The blockchain that will receive native tokens
|`receiver` | bytes | The account that will receive native tokens

### reclaimERC20
```solidity
  function reclaimERC20(
  ) external
```
Transfers locked ERC20 tokens to owner



### reclaimNative
```solidity
  function reclaimNative(
  ) external
```
Transfers locked native tokens to owner



## Events
### Lock
```solidity
  event Lock(
    string destinationHash,
    bytes receiverHash,
    string destination,
    bytes receiver,
    uint256 amount
  )
```
Event emitted when native tokens equivalent to
`amount` of relay tokens are locked via `#lock`

Oracles read this event and unlock
equivalent amount of native tokens on the destination chain
indexed string returns keccak256 of the value
indexed bytes returns keccak256 of the value

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`destinationHash`| string | The blockchain that will receive native tokens
|`receiverHash`| bytes | The account that will receive native tokens
|`destination`| string | The blockchain that will receive native tokens
|`receiver`| bytes | The account that will receive native tokens
|`amount`| uint256 | The amount of relay tokens equivalent to the
amount of locked native tokens
### CalculateFee
```solidity
  event CalculateFee(
    uint256 amountIn,
    uint256 amountOut,
    uint256 feeMin,
    uint256 feePercent,
    uint256 fee,
    uint256 amountMinusFee
  )
```
Event emitted when fees are calculated

precision 3 decimals

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`amountIn`| uint256 | Native tokens sent to dex
|`amountOut`| uint256 | Relay tokens received on dex
|`feeMin`| uint256 | Minimum fee
|`feePercent`| uint256 | Percentage for the fee in %
|`fee`| uint256 | Percentage fee in relay tokens
|`amountMinusFee`| uint256 | Relay tokens minus fees
### DeliverRelay
```solidity
  event DeliverRelay(
  )
```
Event emitted when the relay tokens are traded for
`amount0` of gton swaped for native tokens via '#routeValue'
`amount1` of native tokens sent to the `user` via '#routeValue'


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
### SetIsAllowedChain
```solidity
  event SetIsAllowedChain(
    string chain,
    bool newBool
  )
```
Event emitted when permission for a chain is set via '#setIsAllowedChain'


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`chain`| string | Name of blockchain whose permission is changed, i.e. "FTM", "PLG"
|`newBool`| bool | Updated permission
### SetFees
```solidity
  event SetFees(
    string _feeMin,
    uint256 _feePercent
  )
```
Event emitted when fees are set via '#setFees'


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_feeMin`| string | Minimum fee
|`_feePercent`| uint256 | Percentage fee
### SetLimits
```solidity
  event SetLimits(
    string _lowerLimit,
    uint256 _upperLimit
  )
```
Event emitted when limits are set via '#setLimits'


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_lowerLimit`| string | Minimum fee
|`_upperLimit`| uint256 | Percentage fee
