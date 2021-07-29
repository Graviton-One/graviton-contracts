Parses oracle data about crosschain locking/unlocking events



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


### nebula
```solidity
  function nebula(
  ) external returns (address)
```
User that can send oracle data



### setNebula
```solidity
  function setNebula(
  ) external
```
Sets address of the user that can send oracle data to `_nebula`

Can only be called by the current owner.


### router
```solidity
  function router(
  ) external returns (contract IOracleRouterV2)
```
Address of the contract that routes parsed data to balance keepers



### setRouter
```solidity
  function setRouter(
  ) external
```
Sets address of the oracle router to `_router`



### isEVM
```solidity
  function isEVM(
  ) external returns (bool)
```
TODO



### setIsEVM
```solidity
  function setIsEVM(
    string chain,
    bool newBool
  ) external
```
TODO


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`chain` | string | TODO
|`newBool` | bool | TODO

### uuidIsProcessed
```solidity
  function uuidIsProcessed(
  ) external returns (bool)
```
Look up if the data uuid has already been processed



### deserializeUint
```solidity
  function deserializeUint(
  ) external returns (uint256)
```
Parses a uint value from bytes



### deserializeAddress
```solidity
  function deserializeAddress(
  ) external returns (address)
```
Parses an evm address from bytes



### bytesToBytes32
```solidity
  function bytesToBytes32(
  ) external returns (bytes32)
```
Parses bytes32 from bytes



### bytesToBytes16
```solidity
  function bytesToBytes16(
  ) external returns (bytes16)
```
Parses bytes16 from bytes



### equal
```solidity
  function equal(
  ) external returns (bool)
```
Compares two strings for equality



#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`true`| string | if strings are equal, false otherwise
### attachValue
```solidity
  function attachValue(
  ) external
```
Parses data from oracles, forwards data to the oracle router



## Events
### SetOwner
```solidity
  event SetOwner(
    address ownerOld,
    address ownerNew
  )
```
Event emitted when the owner changes via `#setOwner`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`ownerOld`| address | The account that was the previous owner of the contract
|`ownerNew`| address | The account that became the owner of the contract
### SetNebula
```solidity
  event SetNebula(
    address nebulaOld,
    address nebulaNew
  )
```
Event emitted when the nebula changes via `#setNebula`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`nebulaOld`| address | The account that was the previous nebula
|`nebulaNew`| address | The account that became the nebula
### SetRouter
```solidity
  event SetRouter(
    contract IOracleRouterV2 routerOld,
    contract IOracleRouterV2 routerNew
  )
```
Event emitted when the router changes via `#setRouter`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`routerOld`| contract IOracleRouterV2 | The previous router
|`routerNew`| contract IOracleRouterV2 | The new router
### SetIsEVM
```solidity
  event SetIsEVM(
    string chain,
    bool newBool
  )
```
TODO


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`chain`| string | TODO
|`newBool`| bool | TODO
### AttachValue
```solidity
  event AttachValue(
    address nebula,
    bytes16 uuid,
    string chain,
    bytes emiter,
    bytes32 topic0,
    bytes token,
    bytes sender,
    bytes receiver,
    uint256 amount
  )
```
Event emitted when the data is parsed and forwarded to the oracle router via `#attachValue`

UUID is extracted by the oracles to confirm the delivery of data
receiver is always same as sender, kept for compatibility

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`nebula`| address | The account that sent the parsed data
|`uuid`| bytes16 | Unique identifier of the parsed data
|`chain`| string | Type of blockchain associated with the parsed event, i.e. "EVM"
|`emiter`| bytes | The blockchain-specific address where the parsed event originated
|`topic0`| bytes32 | The topic0 of the parsed event
|`token`| bytes | The blockchain-specific token address
|`sender`| bytes | The blockchain-specific address that sent the tokens
|`receiver`| bytes | The blockchain-specific address to receive the tokens
|`amount`| uint256 | The amount of tokens
