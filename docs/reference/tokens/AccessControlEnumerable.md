
Extension of {AccessControl} that allows enumerating the members of each role.

## Functions
### supportsInterface
```solidity
  function supportsInterface(
  ) public returns (bool)
```

See {IERC165-supportsInterface}.


### getRoleMember
```solidity
  function getRoleMember(
  ) public returns (address)
```

Returns one of the accounts that have `role`. `index` must be a
value between 0 and {getRoleMemberCount}, non-inclusive.

Role bearers are not sorted in any particular way, and their ordering may
change at any point.

WARNING: When using {getRoleMember} and {getRoleMemberCount}, make sure
you perform all queries on the same block. See the following
https://forum.openzeppelin.com/t/iterating-over-elements-on-enumerableset-in-openzeppelin-contracts/2296[forum post]
for more information.


### getRoleMemberCount
```solidity
  function getRoleMemberCount(
  ) public returns (uint256)
```

Returns the number of accounts that have `role`. Can be used
together with {getRoleMember} to enumerate all bearers of a role.


### grantRole
```solidity
  function grantRole(
  ) public
```

Overload {grantRole} to track enumerable memberships


### revokeRole
```solidity
  function revokeRole(
  ) public
```

Overload {revokeRole} to track enumerable memberships


### renounceRole
```solidity
  function renounceRole(
  ) public
```

Overload {renounceRole} to track enumerable memberships


### _setupRole
```solidity
  function _setupRole(
  ) internal
```

Overload {_setupRole} to track enumerable memberships


