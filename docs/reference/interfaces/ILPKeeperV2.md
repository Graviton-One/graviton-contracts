Tracks the amount of locked liquidity provision tokens for each user



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


### canOpen
```solidity
  function canOpen(
  ) external returns (bool)
```
Look up if `user` is allowed to open new governance balances



### canAdd
```solidity
  function canAdd(
  ) external returns (bool)
```
Look up if `user` is allowed to add to governance balances



### canSubtract
```solidity
  function canSubtract(
  ) external returns (bool)
```
Look up if `user` is allowed to subtract from governance balances



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


### balanceKeeper
```solidity
  function balanceKeeper(
  ) external returns (contract IBalanceKeeperV2)
```
Address of the contract that tracks governance balances



### totalTokens
```solidity
  function totalTokens(
  ) external returns (uint256)
```
The number of lp-tokens



### isKnownToken
```solidity
  function isKnownToken(
    uint256 tokenId
  ) external returns (bool)
```
Look up if the `tokenId` has an associated set of user balances


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token

### isKnownToken
```solidity
  function isKnownToken(
    string tokenChain,
    bytes tokenAddress
  ) external returns (bool)
```
Look up if the blockchain-address pair has an associated set of user balances


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token

### tokenChainById
```solidity
  function tokenChainById(
    uint256 tokenId
  ) external returns (string)
```
Look up the type of blockchain associated with `tokenId`


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


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token

### tokenIdByChainAddress
```solidity
  function tokenIdByChainAddress(
    string tokenChain,
    bytes tokenAddress
  ) external returns (uint256)
```
Look up the unique id associated with the blockchain-address pair


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token

### tokenUser
```solidity
  function tokenUser(
    uint256 tokenId
  ) external returns (uint256)
```
Look up the unique id of the user associated with `userIndex` in the token


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token

### tokenUser
```solidity
  function tokenUser(
    string tokenChain,
    bytes tokenAddress
  ) external returns (uint256)
```
Look up the unique id of the user associated with `userIndex` in the token


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


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | uint256 | unique id of the user

### isKnownTokenUser
```solidity
  function isKnownTokenUser(
    uint256 tokenId,
    string userChain,
    bytes userAddress
  ) external returns (bool)
```
Look up if the user has an associated balance of the lp-token


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user

### isKnownTokenUser
```solidity
  function isKnownTokenUser(
    string tokenChain,
    bytes tokenAddress,
    uint256 userId
  ) external returns (bool)
```
Look up if the user has an associated balance of the lp-token


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token
|`userId` | uint256 | unique id of the user

### isKnownTokenUser
```solidity
  function isKnownTokenUser(
    string tokenChain,
    bytes tokenAddress,
    string userChain,
    bytes userAddress
  ) external returns (bool)
```
Look up if the user has an associated balance of the lp-token


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user

### totalTokenUsers
```solidity
  function totalTokenUsers(
    uint256 tokenId
  ) external returns (uint256)
```
The number of users that have associated balances of the lp-token


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token

### totalTokenUsers
```solidity
  function totalTokenUsers(
    string tokenChain,
    bytes tokenAddress
  ) external returns (uint256)
```
The number of users that have associated balances of the lp-token


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token

### balance
```solidity
  function balance(
    uint256 tokenId,
    uint256 userId
  ) external returns (uint256)
```
The amount of lp-tokens locked by the user


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | uint256 | unique id of the user

### balance
```solidity
  function balance(
    uint256 tokenId,
    string userChain,
    bytes userAddress
  ) external returns (uint256)
```
The amount of lp-tokens locked by the user


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user

### balance
```solidity
  function balance(
    string tokenChain,
    bytes tokenAddress,
    uint256 userId
  ) external returns (uint256)
```
The amount of lp-tokens locked by the user


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token
|`userId` | uint256 | unique id of the user

### balance
```solidity
  function balance(
    string tokenChain,
    bytes tokenAddress,
    string userChain,
    bytes userAddress
  ) external returns (uint256)
```
The amount of lp-tokens locked by the user


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user

### totalBalance
```solidity
  function totalBalance(
    uint256 tokenId
  ) external returns (uint256)
```
The total amount of lp-tokens of a given type locked by the users


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token

### totalBalance
```solidity
  function totalBalance(
    string tokenChain,
    bytes tokenAddress
  ) external returns (uint256)
```
The total amount of lp-tokens of a given type locked by the users


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token

### open
```solidity
  function open(
  ) external
```
Opens a set of user balances for the lp-token
associated with the blockchain-address pair



### add
```solidity
  function add(
    uint256 tokenId,
    uint256 userId
  ) external
```
Adds `amount` of lp-tokens to the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | uint256 | unique id of the user

### add
```solidity
  function add(
    uint256 tokenId,
    string userChain,
    bytes userAddress
  ) external
```
Adds `amount` of lp-tokens to the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user

### add
```solidity
  function add(
    string tokenChain,
    bytes tokenAddress,
    uint256 userId
  ) external
```
Adds `amount` of lp-tokens to the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token
|`userId` | uint256 | unique id of the user

### add
```solidity
  function add(
    string tokenChain,
    bytes tokenAddress,
    string userChain,
    bytes userAddress
  ) external
```
Adds `amount` of lp-tokens to the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user

### subtract
```solidity
  function subtract(
    uint256 tokenId,
    uint256 userId
  ) external
```
Subtracts `amount` of lp-tokens from the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userId` | uint256 | unique id of the user

### subtract
```solidity
  function subtract(
    uint256 tokenId,
    string userChain,
    bytes userAddress
  ) external
```
Subtracts `amount` of lp-tokens from the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenId` | uint256 | unique id of the token
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user

### subtract
```solidity
  function subtract(
    string tokenChain,
    bytes tokenAddress,
    uint256 userId
  ) external
```
Subtracts `amount` of lp-tokens from the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token
|`userId` | uint256 | unique id of the user

### subtract
```solidity
  function subtract(
    string tokenChain,
    bytes tokenAddress,
    string userChain,
    bytes userAddress
  ) external
```
Subtracts `amount` of lp-tokens from the user balance


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`tokenChain` | string | the type of blockchain that the token address belongs to, i.e "EVM"
|`tokenAddress` | bytes | blockchain-specific address of the token
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user

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
### SetCanOpen
```solidity
  event SetCanOpen(
    address owner,
    address opener,
    bool newBool
  )
```
Event emitted when the `opener` permission is updated via `#setCanOpen`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`opener`| address | The account whose permission to open token balances was updated
|`newBool`| bool | Updated permission
### SetCanAdd
```solidity
  event SetCanAdd(
    address owner,
    address adder,
    bool newBool
  )
```
Event emitted when the `adder` permission is updated via `#setCanAdd`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`adder`| address | The account whose permission to add to lp-token balances was updated
|`newBool`| bool | Updated permission
### SetCanSubtract
```solidity
  event SetCanSubtract(
    address owner,
    address subtractor,
    bool newBool
  )
```
Event emitted when the `subtractor` permission is updated via `#setCanSubtract`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`subtractor`| address | The account whose permission
to subtract from lp-token balances was updated
|`newBool`| bool | Updated permission
### Open
```solidity
  event Open(
    address opener,
    uint256 tokenId
  )
```
Event emitted when a new `tokenId` is opened


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`opener`| address | The account that opens `tokenId`
|`tokenId`| uint256 | The token account that was opened
### Add
```solidity
  event Add(
    address adder,
    uint256 tokenId,
    uint256 userId,
    uint256 amount
  )
```
Event emitted when the `amount` of `tokenId` lp-tokens
is added to `userId` balance via `#add`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`adder`| address | The account that added to the balance
|`tokenId`| uint256 | The lp-token that was added
|`userId`| uint256 | The account whose lp-token balance was updated
|`amount`| uint256 | The amount of lp-tokens
### Subtract
```solidity
  event Subtract(
    address subtractor,
    uint256 tokenId,
    uint256 userId,
    uint256 amount
  )
```
Event emitted when the `amount` of `tokenId` lp-tokens
is subtracted from `userId` balance via `#subtract`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`subtractor`| address | The account that subtracted from the balance
|`tokenId`| uint256 | The lp-token that was subtracted
|`userId`| uint256 | The account whose lp-token balance was updated
|`amount`| uint256 | The amount of lp-tokens
