


## Functions
### constructor
```solidity
  function constructor(
  ) public
```




### setOwner
```solidity
  function setOwner(
  ) public
```
Transfers ownership of the contract to a new account (`_owner`).

Can only be called by the current owner.


### _blockTimestamp
```solidity
  function _blockTimestamp(
  ) internal returns (uint256)
```

Returns the block timestamp. This method is overridden in tests.


### startFarming
```solidity
  function startFarming(
  ) public
```
Starts the farming campaign



### stopFarming
```solidity
  function stopFarming(
  ) public
```
Stops the farming campaign



### unlockAsset
```solidity
  function unlockAsset(
  ) public
```
Calculates the amount of governance tokens available for the farming campaign

Can only be called after the farming has started
Can only be called before the farming has stopped


