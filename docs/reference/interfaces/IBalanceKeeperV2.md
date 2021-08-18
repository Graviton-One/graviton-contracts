BalanceKeeper tracks governance balance of users



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


### totalUsers
```solidity
  function totalUsers(
  ) external returns (uint256)
```
The number of open governance balances

0xbff1f9e1


### totalBalance
```solidity
  function totalBalance(
  ) external returns (uint256)
```
The sum of all governance balances

0xad7a672f


### isKnownUser
```solidity
  function isKnownUser(
    uint256 userId
  ) external returns (bool)
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
    string userChain,
    bytes userAddress
  ) external returns (bool)
```
Look up if the blockchain-address pair has an associated governance balance

0xf91c1e50
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user


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
    string userChain,
    bytes userAddress
  ) external returns (uint256)
```
The amount of governance tokens owned by the user

0x3777d65a
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user


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
    string userChain,
    bytes userAddress,
    uint256 amount
  ) external
```
Adds `amount` of governance tokens to the user balance

0x7ec8269e
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address of the user
|`amount` | uint256 | the number of governance tokens


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
    string userChain,
    bytes userAddress,
    uint256 amount
  ) external
```
Subtracts `amount` of governance tokens from the user balance

0x22bde2bb
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`userChain` | string | the type of blockchain that the user address belongs to, i.e "EVM"
|`userAddress` | bytes | blockchain-specific address
|`amount` | uint256 | the number of governance tokens


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
|`opener`| address | The account whose permission to open governance balances was updated
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
|`adder`| address | The account whose permission to add to governance balances was updated
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
to subtract from governance balances was updated
|`newBool`| bool | Updated permission

### Open
```solidity
  event Open(
    address opener,
    uint256 userId
  )
```
Event emitted when a new `userId` is opened

0x50042401acb675fedd6dd939fccc629832ce60fa4185df25c01b20e8def195bf
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`opener`| address | The account that opens `userId`
|`userId`| uint256 | The user account that was opened

### Add
```solidity
  event Add(
    address adder,
    uint256 userId,
    uint256 amount
  )
```
Event emitted when the `amount` of governance tokens
is added to `userId` balance via `#add`

0xc264f49177bdbe55a01fae0e77c3fdc75d515d242b32bc4d56c565f5b47865ba
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`adder`| address | The account that added to the balance
|`userId`| uint256 | The account whose governance balance was updated
|`amount`| uint256 | The amount of governance tokens

### Subtract
```solidity
  event Subtract(
    address subtractor,
    uint256 userId,
    uint256 amount
  )
```
Event emitted when the `amount` of governance tokens
is subtracted from `userId` balance via `#subtract`

0x47dd4a08dedb9e7afcf164b736d2a3fcaed9f9d56ec8d5e38aaafde8c22a58a7
#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`subtractor`| address | The account that subtracted from the balance
|`userId`| uint256 | The account whose governance balance was updated
|`amount`| uint256 | The amount of governance token

