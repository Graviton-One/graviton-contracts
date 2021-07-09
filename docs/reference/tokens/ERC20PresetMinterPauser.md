
{ERC20} token, including:

 - ability for holders to burn (destroy) their tokens
 - a minter role that allows for token minting (creation)
 - a pauser role that allows to stop all token transfers

This contract uses {AccessControl} to lock permissioned functions using the
different roles - head to its documentation for details.

The account that deploys the contract will be granted the minter and pauser
roles, as well as the default admin role, which will let it grant both minter
and pauser roles to other accounts.

## Functions
### constructor
```solidity
  function constructor(
  ) public
```

Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE` and `PAUSER_ROLE` to the
account that deploys the contract.

See {ERC20-constructor}.


### mint
```solidity
  function mint(
  ) public
```

Creates `amount` new tokens for `to`.

See {ERC20-_mint}.

Requirements:

- the caller must have the `MINTER_ROLE`.


### pause
```solidity
  function pause(
  ) public
```

Pauses all token transfers.

See {ERC20Pausable} and {Pausable-_pause}.

Requirements:

- the caller must have the `PAUSER_ROLE`.


### unpause
```solidity
  function unpause(
  ) public
```

Unpauses all token transfers.

See {ERC20Pausable} and {Pausable-_unpause}.

Requirements:

- the caller must have the `PAUSER_ROLE`.


### _beforeTokenTransfer
```solidity
  function _beforeTokenTransfer(
  ) internal
```




