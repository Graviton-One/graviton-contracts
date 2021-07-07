


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


### setGTONAddTopic
```solidity
  function setGTONAddTopic(
  ) external
```
Sets topic0 of the event associated with subtracting lp-tokens



### setGTONSubTopic
```solidity
  function setGTONSubTopic(
  ) external
```
Sets topic0 of the event associated with subtracting governance tokens



### setLPAddTopic
```solidity
  function setLPAddTopic(
  ) external
```
Sets topic0 of the event associated with adding lp-tokens



### setLPSubTopic
```solidity
  function setLPSubTopic(
  ) external
```
Sets topic0 of the event associated with subtracting lp-tokens



### setCanRoute
```solidity
  function setCanRoute(
  ) external
```
Sets the permission to route data to balance keepers

Can only be called by the current owner.


### equal
```solidity
  function equal(
  ) internal returns (bool)
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

