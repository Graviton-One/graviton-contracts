Forwards data about crosschain locking/unlocking events to balance keepers



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


### canRoute
```solidity
  function canRoute(
  ) external returns (bool)
```
Look up if `user` can route data to balance keepers



### setCanRoute
```solidity
  function setCanRoute(
  ) external
```
Sets the permission to route data to balance keepers

Can only be called by the current owner.


### balanceKeeper
```solidity
  function balanceKeeper(
  ) external returns (contract IBalanceKeeperV2)
```
Address of the contract that tracks governance balances



### lpKeeper
```solidity
  function lpKeeper(
  ) external returns (contract ILPKeeperV2)
```
Address of the contract that tracks lp-token balances



### gtonAddTopic
```solidity
  function gtonAddTopic(
  ) external returns (bytes32)
```
Look up topic0 of the event associated with adding governance tokens



### gtonSubTopic
```solidity
  function gtonSubTopic(
  ) external returns (bytes32)
```
Look up topic0 of the event associated with subtracting governance tokens



### lpAddTopic
```solidity
  function lpAddTopic(
  ) external returns (bytes32)
```
Look up topic0 of the event associated with adding lp-tokens



### lpSubTopic
```solidity
  function lpSubTopic(
  ) external returns (bytes32)
```
Look up topic0 of the event associated with subtracting lp-tokens



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
### SetCanRoute
```solidity
  event SetCanRoute(
    address owner,
    address parser,
    bool newBool
  )
```
Event emitted when the `parser` permission is updated via `#setCanRoute`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`parser`| address | The account whose permission to route data was updated
|`newBool`| bool | Updated permission
### SetGTONAddTopic
```solidity
  event SetGTONAddTopic(
    bytes32 topicOld,
    bytes32 topicNew
  )
```
Event emitted when the GTONAddTopic is set via '#setGTONAddTopic'


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`topicOld`| bytes32 | The previous topic
|`topicNew`| bytes32 | The new topic
### SetGTONSubTopic
```solidity
  event SetGTONSubTopic(
    bytes32 topicOld,
    bytes32 topicNew
  )
```
Event emitted when the GTONSubTopic is set via '#setGTONSubTopic'


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`topicOld`| bytes32 | The previous topic
|`topicNew`| bytes32 | The new topic
### SetLPAddTopic
```solidity
  event SetLPAddTopic(
    bytes32 topicOld,
    bytes32 topicNew
  )
```
Event emitted when the LPAddTopic is set via '#setLPAddTopic'


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`topicOld`| bytes32 | The previous topic
|`topicNew`| bytes32 | The new topic
### SetLPSubTopic
```solidity
  event SetLPSubTopic(
    bytes32 topicOld,
    bytes32 topicNew
  )
```
Event emitted when the LPSubTopic is set via '#setLPSubTopic'


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`topicOld`| bytes32 | The previous topic
|`topicNew`| bytes32 | The new topic
### RouteValue
```solidity
  event RouteValue(
    bytes16 uuid,
    string chain,
    bytes emiter,
    bytes token,
    bytes sender,
    bytes receiver,
    uint256 amount
  )
```
Event emitted when data is routed

receiver is always same as sender, kept for compatibility

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`uuid`| bytes16 | Unique identifier of the routed data
|`chain`| string | Type of blockchain associated with the routed event, i.e. "EVM"
|`emiter`| bytes | The blockchain-specific address where the data event originated
|`token`| bytes | The blockchain-specific token address
|`sender`| bytes | The blockchain-specific address that sent the tokens
|`receiver`| bytes | The blockchain-specific address to receive the tokens
|`amount`| uint256 | The amount of tokens
### GTONAdd
```solidity
  event GTONAdd(
    bytes16 uuid,
    string chain,
    bytes emiter,
    bytes token,
    bytes sender,
    bytes receiver,
    uint256 amount
  )
```
Event emitted when the data is routed to add to a governance balance

receiver is always same as sender, kept for compatibility

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`uuid`| bytes16 | Unique identifier of the routed data
|`chain`| string | Type of blockchain associated with the routed event, i.e. "EVM"
|`emiter`| bytes | The blockchain-specific address where the data event originated
|`token`| bytes | The blockchain-specific token address
|`sender`| bytes | The blockchain-specific address that sent the tokens
|`receiver`| bytes | The blockchain-specific address to receive the tokens
|`amount`| uint256 | The amount of tokens
### GTONSub
```solidity
  event GTONSub(
    bytes16 uuid,
    string chain,
    bytes emiter,
    bytes token,
    bytes sender,
    bytes receiver,
    uint256 amount
  )
```
Event emitted when the data is routed to subtract from a governance balance

receiver is always same as sender, kept for compatibility

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`uuid`| bytes16 | Unique identifier of the routed data
|`chain`| string | Type of blockchain associated with the routed event, i.e. "EVM"
|`emiter`| bytes | The blockchain-specific address where the data event originated
|`token`| bytes | The blockchain-specific token address
|`sender`| bytes | The blockchain-specific address that sent the tokens
|`receiver`| bytes | The blockchain-specific address to receive the tokens
|`amount`| uint256 | The amount of tokens
### LPAdd
```solidity
  event LPAdd(
    bytes16 uuid,
    string chain,
    bytes emiter,
    bytes token,
    bytes sender,
    bytes receiver,
    uint256 amount
  )
```
Event emitted when the data is routed to add to an lp-token balance

receiver is always same as sender, kept for compatibility

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`uuid`| bytes16 | Unique identifier of the routed data
|`chain`| string | Type of blockchain associated with the routed event, i.e. "EVM"
|`emiter`| bytes | The blockchain-specific address where the data event originated
|`token`| bytes | The blockchain-specific token address
|`sender`| bytes | The blockchain-specific address that sent the tokens
|`receiver`| bytes | The blockchain-specific address to receive the tokens
|`amount`| uint256 | The amount of tokens
### LPSub
```solidity
  event LPSub(
    bytes16 uuid,
    string chain,
    bytes emiter,
    bytes token,
    bytes sender,
    bytes receiver,
    uint256 amount
  )
```
Event emitted when the data is routed to subtract from an lp-token balance

receiver is always same as sender, kept for compatibility

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`uuid`| bytes16 | Unique identifier of the routed data
|`chain`| string | Type of blockchain associated with the routed event, i.e. "EVM"
|`emiter`| bytes | The blockchain-specific address where the data event originated
|`token`| bytes | The blockchain-specific token address
|`sender`| bytes | The blockchain-specific address that sent the tokens
|`receiver`| bytes | The blockchain-specific address to receive the tokens
|`amount`| uint256 | The amount of tokens
