


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


### setCanLock
```solidity
  function setCanLock(
  ) external
```
Sets the permission to lock to `_canLock`



### migrate
```solidity
  function migrate(
  ) external
```
Transfers locked governance tokens to the next version of LockGTON



### lock
```solidity
  function lock(
  ) external
```
Locks `amount` of governance tokens



