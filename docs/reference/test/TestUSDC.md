
Wrapped Ether v10 (WERC10) is an Ether (ETH) ERC-20 wrapper. You can `deposit` ETH and obtain an WERC10 balance which can then be operated as an ERC-20 token. You can
`withdraw` ETH from WERC10, which will then burn WERC10 token in your wallet. The amount of WERC10 token in any wallet is always identical to the
balance of ETH deposited minus the ETH withdrawn with that specific wallet.

## Functions
### owner
```solidity
  function owner(
  ) public returns (address)
```




### changeDCRMOwner
```solidity
  function changeDCRMOwner(
  ) public returns (bool)
```




### Swapin
```solidity
  function Swapin(
  ) public returns (bool)
```




### Swapout
```solidity
  function Swapout(
  ) public returns (bool)
```




### constructor
```solidity
  function constructor(
  ) public
```




### totalSupply
```solidity
  function totalSupply(
  ) external returns (uint256)
```

Returns the total supply of WERC10 token as the ETH held in this contract.


### _mint
```solidity
  function _mint(
  ) internal
```

Creates `amount` tokens and assigns them to `account`, increasing
the total supply.

Emits a {Transfer} event with `from` set to the zero address.

Requirements

- `to` cannot be the zero address.


### _burn
```solidity
  function _burn(
  ) internal
```

Destroys `amount` tokens from `account`, reducing the
total supply.

Emits a {Transfer} event with `to` set to the zero address.

Requirements

- `account` cannot be the zero address.
- `account` must have at least `amount` tokens.


### approve
```solidity
  function approve(
  ) external returns (bool)
```

Sets `value` as allowance of `spender` account over caller account's WERC10 token.
Emits {Approval} event.
Returns boolean value indicating whether operation succeeded.


### approveAndCall
```solidity
  function approveAndCall(
  ) external returns (bool)
```

Sets `value` as allowance of `spender` account over caller account's WERC10 token,
after which a call is executed to an ERC677-compliant contract with the `data` parameter.
Emits {Approval} event.
Returns boolean value indicating whether operation succeeded.
For more information on approveAndCall format, see https://github.com/ethereum/EIPs/issues/677.


### permit
```solidity
  function permit(
  ) external
```

Sets `value` as allowance of `spender` account over `owner` account's WERC10 token, given `owner` account's signed approval.
Emits {Approval} event.
Requirements:
  - `deadline` must be timestamp in future.
  - `v`, `r` and `s` must be valid `secp256k1` signature from `owner` account over EIP712-formatted function arguments.
  - the signature must use `owner` account's current nonce (see {nonces}).
  - the signer cannot be zero address and must be `owner` account.
For more information on signature format, see https://eips.ethereum.org/EIPS/eip-2612#specification[relevant EIP section].
WERC10 token implementation adapted from https://github.com/albertocuestacanada/ERC20Permit/blob/master/contracts/ERC20Permit.sol.


### transferWithPermit
```solidity
  function transferWithPermit(
  ) external returns (bool)
```




### verifyEIP712
```solidity
  function verifyEIP712(
  ) internal returns (bool)
```




### verifyPersonalSign
```solidity
  function verifyPersonalSign(
  ) internal returns (bool)
```




### prefixed
```solidity
  function prefixed(
  ) internal returns (bytes32)
```




### transfer
```solidity
  function transfer(
  ) external returns (bool)
```

Moves `value` WERC10 token from caller's account to account (`to`).
A transfer to `address(0)` triggers an ETH withdraw matching the sent WERC10 token in favor of caller.
Emits {Transfer} event.
Returns boolean value indicating whether operation succeeded.
Requirements:
  - caller account must have at least `value` WERC10 token.


### transferFrom
```solidity
  function transferFrom(
  ) external returns (bool)
```

Moves `value` WERC10 token from account (`from`) to account (`to`) using allowance mechanism.
`value` is then deducted from caller account's allowance, unless set to `type(uint256).max`.
A transfer to `address(0)` triggers an ETH withdraw matching the sent WERC10 token in favor of caller.
Emits {Approval} event to reflect reduced allowance `value` for caller account to spend from account (`from`),
unless allowance is set to `type(uint256).max`
Emits {Transfer} event.
Returns boolean value indicating whether operation succeeded.
Requirements:
  - `from` account must have at least `value` balance of WERC10 token.
  - `from` account must have approved caller to spend at least `value` of WERC10 token, unless `from` and caller are the same account.


### transferAndCall
```solidity
  function transferAndCall(
  ) external returns (bool)
```

Moves `value` WERC10 token from caller's account to account (`to`),
after which a call is executed to an ERC677-compliant contract with the `data` parameter.
A transfer to `address(0)` triggers an ETH withdraw matching the sent WERC10 token in favor of caller.
Emits {Transfer} event.
Returns boolean value indicating whether operation succeeded.
Requirements:
  - caller account must have at least `value` WERC10 token.
For more information on transferAndCall format, see https://github.com/ethereum/EIPs/issues/677.


## Events
### LogChangeDCRMOwner
```solidity
  event LogChangeDCRMOwner(
  )
```



### LogSwapin
```solidity
  event LogSwapin(
  )
```



### LogSwapout
```solidity
  event LogSwapout(
  )
```



