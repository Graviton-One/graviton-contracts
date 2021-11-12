//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IFarmProxy {
    function deposit(uint256 _pid, uint256 _amount) external;
    function withdraw(uint256 _pid, uint256 _amount) external;
    function pendingRelict(uint256 _pid, address _user) external view returns (uint256);
}