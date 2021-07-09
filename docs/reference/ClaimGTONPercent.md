


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


### setWallet
```solidity
  function setWallet(
  ) public
```
The maximum amount of tokens available for claiming until the limit term is over



### setVoter
```solidity
  function setVoter(
  ) public
```
Sets the address of the voting contract



### setClaimActivated
```solidity
  function setClaimActivated(
  ) public
```
Sets the permission to claim to `_claimActivated`



### setLimitActivated
```solidity
  function setLimitActivated(
  ) public
```
Sets the limit to `_limitActivated`



### _blockTimestamp
```solidity
  function _blockTimestamp(
  ) internal returns (uint256)
```

Returns the block timestamp. This method is overridden in tests.


### claim
```solidity
  function claim(
  ) public
```
Transfers `amount` of governance tokens to the caller



