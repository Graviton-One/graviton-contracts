


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
Transfers ownership of the contract to a new account (`_owner`)

Can only be called by the current owner


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



