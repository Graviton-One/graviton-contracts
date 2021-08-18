


## Functions
### receive
```solidity
  function receive(
  ) external
```




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



### setCanRoute
```solidity
  function setCanRoute(
  ) external
```
Sets the permission to route data to balance keepers

Can only be called by the current owner.


### setRelayTopic
```solidity
  function setRelayTopic(
  ) external
```
Sets topic0 of the event associated with initiating a relay transfer



### equal
```solidity
  function equal(
  ) internal returns (bool)
```




### deserializeUint
```solidity
  function deserializeUint(
  ) internal returns (uint256)
```




### deserializeAddress
```solidity
  function deserializeAddress(
  ) internal returns (address)
```




### routeValue
```solidity
  function routeValue(
    bytes16 uuid,
    string chain,
    bytes emiter,
    bytes32 topic0,
    bytes token,
    bytes sender,
    bytes receiver,
    uint256 amount
  ) external
```
Routes value to balance keepers according to the type of event associated with topic0

receiver is always same as sender, kept for compatibility

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`uuid` | bytes16 | Unique identifier of the routed data
|`chain` | string | Type of blockchain associated with the routed event, i.e. "EVM"
|`emiter` | bytes | The blockchain-specific address where the data event originated
|`topic0` | bytes32 | Unique identifier of the event
|`token` | bytes | The blockchain-specific token address
|`sender` | bytes | The blockchain-specific address that sent the tokens
|`receiver` | bytes | The blockchain-specific address to receive the tokens
|`amount` | uint256 | The amount of tokens

