BalanceKeeper tracks governance balance of users



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


### totalUsers
```solidity
  function totalUsers(
  ) external returns (uint256)
```
The number of open governance balances



### totalBalance
```solidity
  function totalBalance(
  ) external returns (uint256)
```
The sum of all governance balances



### isKnownUser
```solidity
  function isKnownUser(
    uint256 userId
  ) external returns (bool)
```
Look up if the `userId` has an associated governance balance


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
    string userChain,
    bytes userAddress
  ) external returns (uint256)
```
The amount of governance tokens owned by the user


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
    string userChain,
    bytes userAddress,
    uint256 amount
  ) external
```
Adds `amount` of governance tokens to the user balance


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


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`subtractor`| address | The account that subtracted from the balance
|`userId`| uint256 | The account whose governance balance was updated
|`amount`| uint256 | The amount of governance token
