Locks governance tokens



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



### governanceToken
```solidity
  function governanceToken(
  ) external returns (contract IERC20)
```
Address of the governance token



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
### LockGTON
```solidity
  event LockGTON(
    address governanceToken,
    address sender,
    address receiver,
    uint256 amount
  )
```
Event emitted when the `sender` locks `amount` of governance tokens

LockGTON event is not called Lock so the topic0 is different
from the lp-token locking event when parsed by the oracle parser
governanceToken is specified so the event has the same number of topics
as the lp-token locking event when parsed by the oracle parser
receiver is always same as sender, kept for compatibility

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`governanceToken`| address | The address of governance token
|`sender`| address | The account that locked governance tokens
|`receiver`| address | The account to whose governance balance the tokens are added
|`amount`| uint256 | The amount of governance tokens locked
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
### Migrate
```solidity
  event Migrate(
    address newLock,
    uint256 amount
  )
```
Event emitted when the locked governance tokens are transfered the another version of LockGTON


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`newLock`| address | The new Lock contract
|`amount`| uint256 | Amount of tokens migrated
