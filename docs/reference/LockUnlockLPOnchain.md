


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


### setIsAllowedToken
```solidity
  function setIsAllowedToken(
  ) external
```
Sets permission to lock `token` to `_isAllowedToken`



### setLockLimit
```solidity
  function setLockLimit(
  ) external
```
Sets minimum lock amount limit for `token` to `_lockLimit`



### setCanLock
```solidity
  function setCanLock(
  ) external
```
Sets the permission to lock to `_canLock`



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



