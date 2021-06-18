//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";

interface ILockGTON {
    function owner() external view returns (address);
    function governanceToken() external view returns (IERC20);
    function canLock() external view returns (bool);
    function setOwner(address _owner) external;
    function setCanLock(bool _canLock) external;
    function migrate(address to, uint amount) external;
    function lock(address receiver, uint amount) external;
}
