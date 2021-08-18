
Wrapped ERC-20 v10 (WERC10) is an ERC-20 ERC-20 wrapper. You can `deposit` ERC-20 and obtain an WERC10 balance which can then be operated as an ERC-20 token. You can
`withdraw` ERC-20 from WERC10, which will then burn WERC10 token in your wallet. The amount of WERC10 token in any wallet is always identical to the
balance of ERC-20 deposited minus the ERC-20 withdrawn with that specific wallet.

## Functions
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


### transferAndCall
```solidity
  function transferAndCall(
  ) external returns (bool)
```

Moves `value` WERC10 token from caller's account to account (`to`),
after which a call is executed to an ERC677-compliant contract with the `data` parameter.
A transfer to `address(0)` triggers an ERC-20 withdraw matching the sent WERC10 token in favor of caller.
Emits {Transfer} event.
Returns boolean value indicating whether operation succeeded.
Requirements:
  - caller account must have at least `value` WERC10 token.
For more information on transferAndCall format, see https://github.com/ethereum/EIPs/issues/677.


