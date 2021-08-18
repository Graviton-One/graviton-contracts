Trades native tokens for gton, starts crosschain transfer



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
Transfers ownership of the contract to a new account (`_owner`)

Can only be called by the current owner


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
### SetOwner
```solidity
  event SetOwner(
    address ownerOld,
    address ownerNew
  )
```
Event emitted when the owner changes via #setOwner`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`ownerOld`| address | The account that was the previous owner of the contract
|`ownerNew`| address | The account that became the owner of the contract
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
