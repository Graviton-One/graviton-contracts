Settles claims of tokens according to the governance balance of users



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


### governanceToken
```solidity
  function governanceToken(
  ) external returns (contract IERC20)
```
Address of the governance token



### balanceKeeper
```solidity
  function balanceKeeper(
  ) external returns (contract IBalanceKeeperV2)
```
Address of the contract that tracks governance balances



### voter
```solidity
  function voter(
  ) external returns (contract IVoterV2)
```
Address of the voting contract



### wallet
```solidity
  function wallet(
  ) external returns (address)
```
Address of the wallet from which to withdraw governance tokens



### claimActivated
```solidity
  function claimActivated(
  ) external returns (bool)
```
Look up if claiming is allowed



### limitActivated
```solidity
  function limitActivated(
  ) external returns (bool)
```
Look up if the limit on claiming has been activated



### lastLimitTimestamp
```solidity
  function lastLimitTimestamp(
  ) external returns (uint256)
```
Look up the beginning the limit term for the `user`

Equal to 0 before the user's first claim


### limitMax
```solidity
  function limitMax(
  ) external returns (uint256)
```
The maximum amount of tokens the `user` can claim until the limit term is over

Equal to 0 before the user's first claim
Updates to `limitPercent` of user's balance at the start of the new limit term


### setVoter
```solidity
  function setVoter(
  ) external
```
Sets the address of the voting contract



### setWallet
```solidity
  function setWallet(
  ) external
```
The maximum amount of tokens available for claiming until the limit term is over



### setClaimActivated
```solidity
  function setClaimActivated(
  ) external
```
Sets the permission to claim to `_claimActivated`



### setLimitActivated
```solidity
  function setLimitActivated(
  ) external
```
Sets the limit to `_limitActivated`



### claim
```solidity
  function claim(
  ) external
```
Transfers `amount` of governance tokens to the caller



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
### SetVoter
```solidity
  event SetVoter(
    contract IVoterV2 voterOld,
    contract IVoterV2 voterNew
  )
```
Event emitted when the voter changes via `#setVoter`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`voterOld`| contract IVoterV2 | The previous voting contract
|`voterNew`| contract IVoterV2 | The new voting contract
### SetWallet
```solidity
  event SetWallet(
    address walletOld,
    address walletNew
  )
```
Event emitted when the wallet changes via `#setWallet`.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`walletOld`| address | The previous wallet
|`walletNew`| address | The new wallet
### Claim
```solidity
  event Claim(
    address sender,
    address receiver,
    uint256 amount
  )
```
Event emitted when the `sender` claims `amount` of governance tokens

receiver is always same as sender, kept for compatibility

#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`sender`| address | The account from whose governance balance tokens were claimed
|`receiver`| address | The account to which governance tokens were transferred
|`amount`| uint256 | The amount of governance tokens claimed
