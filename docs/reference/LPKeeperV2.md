


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


### isKnownToken
```solidity
  function isKnownToken(
    uint256 tokenId
  ) public returns (bool)
```
Look up if the `tokenId` has an associated set of user balances

0x7315bbd5
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token


### isKnownToken
```solidity
  function isKnownToken(
    string tokenId
  ) public returns (bool)
```
Look up if the `tokenId` has an associated set of user balances

0x7315bbd5
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token


### tokenChainById
```solidity
  function tokenChainById(
    uint256 tokenId
  ) external returns (string)
```
Look up the type of blockchain associated with `tokenId`

0x7ac05698
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token


### tokenAddressById
```solidity
  function tokenAddressById(
    uint256 tokenId
  ) external returns (bytes)
```
Look up the blockchain-specific address associated with `tokenId`

0xde952a09
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token


### tokenChainAddressById
```solidity
  function tokenChainAddressById(
    uint256 tokenId
  ) external returns (string, bytes)
```
Look up the blockchain-address pair associated with `tokenId`

0x57dc6209
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token


### tokenIdByChainAddress
```solidity
  function tokenIdByChainAddress(
    string tokenChain,
    bytes tokenAddress
  ) public returns (uint256)
```
Look up the unique id associated with the blockchain-address pair

0xb30b3245
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token


### isKnownTokenUser
```solidity
  function isKnownTokenUser(
    uint256 tokenId,
    uint256 userId
  ) external returns (bool)
```
Look up if the user has an associated balance of the lp-token

0x47dcbaa2
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | uint256 | unique id of the user


### isKnownTokenUser
```solidity
  function isKnownTokenUser(
    string tokenId,
    bytes userId
  ) external returns (bool)
```
Look up if the user has an associated balance of the lp-token

0x47dcbaa2
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token
|`userId` | bytes | unique id of the user


### isKnownTokenUser
```solidity
  function isKnownTokenUser(
    uint256 tokenId,
    string userId
  ) external returns (bool)
```
Look up if the user has an associated balance of the lp-token

0x47dcbaa2
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | string | unique id of the user


### isKnownTokenUser
```solidity
  function isKnownTokenUser(
    string tokenId,
    bytes userId
  ) external returns (bool)
```
Look up if the user has an associated balance of the lp-token

0x47dcbaa2
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token
|`userId` | bytes | unique id of the user


### tokenUser
```solidity
  function tokenUser(
    uint256 tokenId
  ) external returns (uint256)
```
Look up the unique id of the user associated with `userIndex` in the token

0x187c459a
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token


### tokenUser
```solidity
  function tokenUser(
    string tokenId
  ) external returns (uint256)
```
Look up the unique id of the user associated with `userIndex` in the token

0x187c459a
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token


### totalTokenUsers
```solidity
  function totalTokenUsers(
    uint256 tokenId
  ) public returns (uint256)
```
The number of users that have associated balances of the lp-token

0x211d9154
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token


### totalTokenUsers
```solidity
  function totalTokenUsers(
    string tokenId
  ) external returns (uint256)
```
The number of users that have associated balances of the lp-token

0x211d9154
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token


### balance
```solidity
  function balance(
    uint256 tokenId,
    uint256 userId
  ) external returns (uint256)
```
The amount of lp-tokens locked by the user

0x94813dd1
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | uint256 | unique id of the user


### balance
```solidity
  function balance(
    uint256 tokenId,
    string userId
  ) external returns (uint256)
```
The amount of lp-tokens locked by the user

0x94813dd1
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | string | unique id of the user


### balance
```solidity
  function balance(
    string tokenId,
    bytes userId
  ) external returns (uint256)
```
The amount of lp-tokens locked by the user

0x94813dd1
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token
|`userId` | bytes | unique id of the user


### balance
```solidity
  function balance(
    string tokenId,
    bytes userId
  ) external returns (uint256)
```
The amount of lp-tokens locked by the user

0x94813dd1
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token
|`userId` | bytes | unique id of the user


### totalBalance
```solidity
  function totalBalance(
    uint256 tokenId
  ) external returns (uint256)
```
The total amount of lp-tokens of a given type locked by the users

0xb7201c83
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token


### totalBalance
```solidity
  function totalBalance(
    string tokenId
  ) external returns (uint256)
```
The total amount of lp-tokens of a given type locked by the users

0xb7201c83
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token


### open
```solidity
  function open(
  ) external
```
Opens a set of user balances for the lp-token
associated with the blockchain-address pair

0xd41ebce1


### add
```solidity
  function add(
    uint256 tokenId,
    uint256 userId
  ) external
```
Adds `amount` of lp-tokens to the user balance

0x505fb46c
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | uint256 | unique id of the user


### add
```solidity
  function add(
    uint256 tokenId,
    string userId
  ) external
```
Adds `amount` of lp-tokens to the user balance

0x505fb46c
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | string | unique id of the user


### add
```solidity
  function add(
    string tokenId,
    bytes userId
  ) external
```
Adds `amount` of lp-tokens to the user balance

0x505fb46c
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token
|`userId` | bytes | unique id of the user


### add
```solidity
  function add(
    string tokenId,
    bytes userId
  ) external
```
Adds `amount` of lp-tokens to the user balance

0x505fb46c
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token
|`userId` | bytes | unique id of the user


### _add
```solidity
  function _add(
  ) internal
```




### subtract
```solidity
  function subtract(
    uint256 tokenId,
    uint256 userId
  ) external
```
Subtracts `amount` of lp-tokens from the user balance

0x7f9b8dd4
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | uint256 | unique id of the user


### subtract
```solidity
  function subtract(
    uint256 tokenId,
    string userId
  ) external
```
Subtracts `amount` of lp-tokens from the user balance

0x7f9b8dd4
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | string | unique id of the user


### subtract
```solidity
  function subtract(
    string tokenId,
    bytes userId
  ) external
```
Subtracts `amount` of lp-tokens from the user balance

0x7f9b8dd4
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token
|`userId` | bytes | unique id of the user


### subtract
```solidity
  function subtract(
    string tokenId,
    bytes userId
  ) external
```
Subtracts `amount` of lp-tokens from the user balance

0x7f9b8dd4
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | string | unique id of the token
|`userId` | bytes | unique id of the user


### _subtract
```solidity
  function _subtract(
  ) internal
```




