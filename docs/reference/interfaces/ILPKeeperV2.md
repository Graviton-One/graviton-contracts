Tracks the amount of locked liquidity provision tokens for each user



## Functions
### owner
```solidity
  function owner(
  ) external returns (address)
```
User that can grant access permissions and perform privileged actions

0x8da5cb5b


### setOwner
```solidity
  function setOwner(
  ) external
```
Transfers ownership of the contract to a new account (`_owner`).

Can only be called by the current owner.
0x13af4035


### canOpen
```solidity
  function canOpen(
  ) external returns (bool)
```
Look up if `user` is allowed to open new governance balances

0x9b2cf1a9


### canAdd
```solidity
  function canAdd(
  ) external returns (bool)
```
Look up if `user` is allowed to add to governance balances

0x289420c1


### canSubtract
```solidity
  function canSubtract(
  ) external returns (bool)
```
Look up if `user` is allowed to subtract from governance balances

0x5fe1c47e


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


### balanceKeeper
```solidity
  function balanceKeeper(
  ) external returns (contract IBalanceKeeperV2)
```
Address of the contract that tracks governance balances

0xfd44f921


### totalTokens
```solidity
  function totalTokens(
  ) external returns (uint256)
```
The number of lp-tokens

0x7e1c0c09


### isKnownToken
```solidity
  function isKnownToken(
    uint256 tokenId
  ) external returns (bool)
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
    string tokenChain,
    bytes tokenAddress
  ) external returns (bool)
```
Look up if the blockchain-address pair has an associated set of user balances

0xaab27467
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
  ) external returns (uint256)
```
Look up the unique id associated with the blockchain-address pair

0xb30b3245
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

0x187c459a
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

0x19f56b71
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
    uint256 tokenId,
    string userChain,
    bytes userAddress
  ) external returns (bool)
```
Look up if the user has an associated balance of the lp-token

0x5682ce8c
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

0x5180602f
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

0xfe3d2a5d
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

0x211d9154
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

0x544d189f
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
    string userChain,
    bytes userAddress
  ) external returns (uint256)
```
The amount of lp-tokens locked by the user

0x90d6a941
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

0x074c9750
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

0xea4ee101
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

0xb7201c83
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

0x16c4faa8
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
    string userChain,
    bytes userAddress
  ) external
```
Adds `amount` of lp-tokens to the user balance

0x1a1679e7
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

0x62882f4b
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

0xa3a49296
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
    string userChain,
    bytes userAddress
  ) external
```
Subtracts `amount` of lp-tokens from the user balance

0xb48ffdb9
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

0x2daf5799
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

0x5f2ecbb2
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

0xcbf985117192c8f614a58aaf97226bb80a754772f5f6edf06f87c675f2e6c663
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

0x1317484b2184978eae33164465cb4df6d4e79982c6516a36ec4ada226eb1d345
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

0xcfc65705d7d3022a56eae794c52cdedeac637251211c8c3345af78eee9cbe546
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

0xc954f3ae852ebf9ca68e929d8e491727fcd9893a8c84c053fcf2a2637b8d5000
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

0x50042401acb675fedd6dd939fccc629832ce60fa4185df25c01b20e8def195bf
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

0xa2ba758028b7d21eee988892461f8630fe375441d69998d867174616c5eef8fb
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

0xb271e8aacff5df8ac4dd0fc1a4da3cc1d39edb125050765b9ed0e5103af9fa3c
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`subtractor`| address | The account that subtracted from the balance
|`tokenId`| uint256 | The lp-token that was subtracted
|`userId`| uint256 | The account whose lp-token balance was updated
|`amount`| uint256 | The amount of lp-tokens

