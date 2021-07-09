


## Functions
### setOwner
```solidity
  function setOwner(
  ) external
```
Transfers ownership of the contract to a new account (`_owner`).

Can only be called by the current owner.


### setCanOpen
```solidity
  function setCanOpen(
  ) external
```
Sets `opener` permission to open new governance balances to `_canOpen`

Can only be called by the current owner.


### setCanAdd
```solidity
  function setCanAdd(
  ) external
```
Sets `adder` permission to open new governance balances to `_canAdd`

Can only be called by the current owner.


### setCanSubtract
```solidity
  function setCanSubtract(
  ) external
```
Sets `subtractor` permission to open new governance balances to `_canSubtract`

Can only be called by the current owner.


### isKnownUser
```solidity
  function isKnownUser(
    uint256 userId
  ) public returns (bool)
```
Look up if the `userId` has an associated governance balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | uint256 | unique id of the user

### isKnownUser
```solidity
  function isKnownUser(
    string userId
  ) public returns (bool)
```
Look up if the `userId` has an associated governance balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | string | unique id of the user

### userChainById
```solidity
  function userChainById(
    uint256 userId
  ) external returns (string)
```
Look up the type of blockchain associated with `userId`


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | uint256 | unique id of the user

### userAddressById
```solidity
  function userAddressById(
    uint256 userId
  ) external returns (bytes)
```
Look up the blockchain-specific address associated with `userId`


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | uint256 | unique id of the user

### userChainAddressById
```solidity
  function userChainAddressById(
    uint256 userId
  ) external returns (string, bytes)
```
Look up the blockchain-address pair associated with `userId`


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | uint256 | unique id of the user

### userIdByChainAddress
```solidity
  function userIdByChainAddress(
    string userChain,
    bytes userAddress
  ) external returns (uint256)
```
Look up the unique id associated with the blockchain-address pair


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user

### balance
```solidity
  function balance(
    uint256 userId
  ) external returns (uint256)
```
The amount of governance tokens owned by the user


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | uint256 | unique id of the user

### balance
```solidity
  function balance(
    string userId
  ) external returns (uint256)
```
The amount of governance tokens owned by the user


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | string | unique id of the user

### open
```solidity
  function open(
    string userChain,
    bytes userAddress
  ) external
```
Opens a new user governance balance associated with the blockchain-address pair


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user

### add
```solidity
  function add(
    uint256 userId,
    uint256 amount
  ) external
```
Adds `amount` of governance tokens to the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | uint256 | unique id of the user
|`amount` | uint256 | the number of governance tokens

### add
```solidity
  function add(
    string userId,
    bytes amount
  ) external
```
Adds `amount` of governance tokens to the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | string | unique id of the user
|`amount` | bytes | the number of governance tokens

### _add
```solidity
  function _add(
  ) internal
```




### subtract
```solidity
  function subtract(
    uint256 userId,
    uint256 amount
  ) external
```
Subtracts `amount` of governance tokens from the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | uint256 | unique id of the user
|`amount` | uint256 | the number of governance tokens

### subtract
```solidity
  function subtract(
    string userId,
    bytes amount
  ) external
```
Subtracts `amount` of governance tokens from the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userId` | string | unique id of the user
|`amount` | bytes | the number of governance tokens

### _subtract
```solidity
  function _subtract(
  ) internal
```




### shareById
```solidity
  function shareById(
  ) external returns (uint256)
```
User's share in the farming campaign



### totalShares
```solidity
  function totalShares(
  ) external returns (uint256)
```
The total number of shares in the farming campaign



### userIdByIndex
```solidity
  function userIdByIndex(
  ) external returns (uint256)
```
Unique identifier of nth user



