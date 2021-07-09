
ERC20 token with pausable token transfers, minting and burning.

Useful for scenarios such as preventing trades until the end of an evaluation
period, or having an emergency switch for freezing all token transfers in the
event of a large bug.

## Functions
### _beforeTokenTransfer
```solidity
  function _beforeTokenTransfer(
  ) internal
```

See {ERC20-_beforeTokenTransfer}.

Requirements:

- the contract must not be paused.


