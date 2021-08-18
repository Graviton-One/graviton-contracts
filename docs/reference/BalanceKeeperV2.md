


## Functions
### setOwner
```solidity
  function setOwner(
  ) external
```
Transfers ownership of the contract to a new account (`_owner`).

Can only be called by the current owner.
0x13af4035


### setCanOpen
```solidity
  function setCanOpen(
  ) external
```
Sets `opener` permission to open new governance balances to `_canOpen`

Can only be called by the current owner.
0x05bc1030


### setCanAdd
```solidity
  function setCanAdd(
  ) external
```
Sets `adder` permission to open new governance balances to `_canAdd`

Can only be called by the current owner.
0xe235cef2


### setCanSubtract
```solidity
  function setCanSubtract(
  ) external
```
Sets `subtractor` permission to open new governance balances to `_canSubtract`

Can only be called by the current owner.
0x7241ef34


### isKnownUser
```solidity
  function isKnownUser(
    uint256 userId
  ) public returns (bool)
```
Look up if the `userId` has an associated governance balance

0xe8e55018
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

0xe8e55018
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

0xeaff261b
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

0x4aed47cf
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

0xece10876
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

0x3ed084c4
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

0x47bb89f0
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

0x47bb89f0
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

0xd41ebce1
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

0x771602f7
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

0x771602f7
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

0x3ef5e445
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

0x3ef5e445
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



