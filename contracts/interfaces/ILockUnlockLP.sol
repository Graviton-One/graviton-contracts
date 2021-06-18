//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";

interface ILockUnlockLP {
    function owner() external view returns (address);
    function isAllowedToken(address token) external view returns (bool);
    function tokenSupply(address token) external view returns (uint);
    function totalSupply() external view returns (uint);
    function setOwner(address _owner) external;
    function setIsAllowedToken(address token, bool _isAllowedToken) external;
    function balance(address token, address depositer) external view returns (uint);
    function lock(address token, address receiver, uint amount) external;
    function unlock(address token, address receiver, uint amount) external;
}
