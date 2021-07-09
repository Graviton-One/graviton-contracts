Calculates the number of governance tokens
available for distribution in a farming campaign



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


### totalUnlocked
```solidity
  function totalUnlocked(
  ) external returns (uint256)
```
The amount of governance tokens available for the farming campaign



### farmingStarted
```solidity
  function farmingStarted(
  ) external returns (bool)
```
Look up if the farming campaign has been started



### farmingStopped
```solidity
  function farmingStopped(
  ) external returns (bool)
```
Look up if the farming campaign has been stopped



### startTimestamp
```solidity
  function startTimestamp(
  ) external returns (uint256)
```
Look up when the farming has started



### lastTimestamp
```solidity
  function lastTimestamp(
  ) external returns (uint256)
```
Look up the last time when the farming was calculated



### startFarming
```solidity
  function startFarming(
  ) external
```
Starts the farming campaign



### stopFarming
```solidity
  function stopFarming(
  ) external
```
Stops the farming campaign



### unlockAsset
```solidity
  function unlockAsset(
  ) external
```
Calculates the amount of governance tokens available for the farming campaign

Can only be called after the farming has started
Can only be called before the farming has stopped


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
