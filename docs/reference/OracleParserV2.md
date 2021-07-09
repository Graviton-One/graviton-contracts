


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


### setNebula
```solidity
  function setNebula(
  ) external
```
Sets address of the user that can send oracle data to `_nebula`

Can only be called by the current owner.


### setOracleRouter
```solidity
  function setOracleRouter(
  ) external
```
Sets address of the oracle router to `_oracleRouter`



### setEVMChains
```solidity
  function setEVMChains(
    string[] _evmChains
  ) external
```
Sets the array of chains parsed as "EVM"


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_evmChains` | string[] | Array of blockchain names, i.e. ["ETH","BNB","FTM"]

### deserializeUint
```solidity
  function deserializeUint(
  ) public returns (uint256)
```
Parses a uint value from bytes



### deserializeAddress
```solidity
  function deserializeAddress(
  ) public returns (address)
```
Parses an evm address from bytes



### bytesToBytes32
```solidity
  function bytesToBytes32(
  ) public returns (bytes32)
```
Parses bytes32 from bytes



### bytesToBytes16
```solidity
  function bytesToBytes16(
  ) public returns (bytes16)
```
Parses bytes16 from bytes



### equal
```solidity
  function equal(
  ) public returns (bool)
```
Compares two strings for equality



#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`true`| string | if strings are equal, false otherwise
### processChain
```solidity
  function processChain(
  ) internal returns (string)
```




### attachValue
```solidity
  function attachValue(
  ) external
```
Parses data from oracles, forwards data to the oracle router



