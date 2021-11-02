//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";
import "./IFarmProxy.sol";
import "./IPoolProxy.sol";
import "./IPoolPair.sol";

interface ICan {
    function toggleRevert() external;
    function transferOwnership(address newOwner) external;
    function emergencyTakeout(IERC20 _token, address _to, uint _amount) external;
    function changeCanFee(uint _fee) external;
    function updateCan () external;
    function mintFor(address _user, uint _providedAmount) external;
    function burnFor(address _user, uint _providedAmount, uint _rewardAmount) external;
    function transfer(address _from, address _to, uint _providingAmount, uint _rewardAmount) external;
    function emergencySendToFarming(uint _amount) external;
    function emergencyGetFromFarming(uint _amount) external;
}
