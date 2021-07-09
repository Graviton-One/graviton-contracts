Locks liquidity provision tokens



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


### canLock
```solidity
  function canLock(
  ) external returns (bool)
```
Look up if locking is allowed



### setCanLock
```solidity
  function setCanLock(
  ) external
```
Sets the permission to lock to `_canLock`



### isAllowedToken
```solidity
  function isAllowedToken(
  ) external returns (bool)
```
Look up if the locking of `token` is allowed



### lockLimit
```solidity
  function lockLimit(
  ) external returns (uint256)
```
Look up if the locking of `token` is allowed



### setLockLimit
```solidity
  function setLockLimit(
  ) external
```
Sets minimum lock amount limit for `token` to `_lockLimit`



### tokenSupply
```solidity
  function tokenSupply(
  ) external returns (uint256)
```
The total amount of locked `token`



### totalSupply
```solidity
  function totalSupply(
  ) external returns (uint256)
```
The total amount of all locked lp-tokens



### setIsAllowedToken
```solidity
  function setIsAllowedToken(
  ) external
```
Sets permission to lock `token` to `_isAllowedToken`



### balance
```solidity
  function balance(
  ) external returns (uint256)
```
The amount of `token` locked by `depositer`



### lock
```solidity
  function lock(
  ) external
```
Transfers `amount` of `token` from the caller to LockUnlockLP



### unlock
```solidity
  function unlock(
  ) external
```
Transfers `amount` of `token` from LockUnlockLP to the caller



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
### Lock
```solidity
  event Lock(
    address token,
    address sender,
    address receiver,
    uint256 amount
  )
```
Event emitted when the `sender` locks `amount` of `token` lp-tokens

receiver is always same as sender, kept for compatibility

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`token`| address | The address of the lp-token
|`sender`| address | The account that locked lp-token
|`receiver`| address | The account to whose lp-token balance the tokens are added
|`amount`| uint256 | The amount of lp-tokens locked
### Unlock
```solidity
  event Unlock(
    address token,
    address sender,
    address receiver,
    uint256 amount
  )
```
Event emitted when the `sender` unlocks `amount` of `token` lp-tokens

receiver is always same as sender, kept for compatibility

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`token`| address | The address of the lp-token
|`sender`| address | The account that locked lp-token
|`receiver`| address | The account to whose lp-token balance the tokens are added
|`amount`| uint256 | The amount of lp-tokens unlocked
### SetIsAllowedToken
```solidity
  event SetIsAllowedToken(
    address owner,
    address token,
    bool newBool
  )
```
Event emitted when the permission to lock token is updated via `#setIsAllowedToken`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`token`| address | The lp-token whose permission was updated
|`newBool`| bool | Updated permission
### SetLockLimit
```solidity
  event SetLockLimit(
    address owner,
    address token,
    uint256 _lockLimit
  )
```
Event emitted when the minimum lock amount limit updated via `#setLockLimit`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`token`| address | The lp-token whose permission was updated
|`_lockLimit`| uint256 | New minimum lock amount limit
### SetCanLock
```solidity
  event SetCanLock(
    address owner,
    bool newBool
  )
```
Event emitted when the permission to lock is updated via `#setCanLock`


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`owner`| address | The owner account at the time of change
|`newBool`| bool | Updated permission
