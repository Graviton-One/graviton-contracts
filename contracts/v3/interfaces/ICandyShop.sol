//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";
import "./IFarmProxy.sol";
import "./IPoolProxy.sol";
import "./IPoolPair.sol";

interface ICandyShop {
    function toggleRevert() external;
    function transferOwnership(address newOwner) external;
    function emergencyTakeout(IERC20 _token, address _to, uint _amount) external;
    function createCan (
        address _farmAddress,
        uint _farmId,
        IFarmProxy _farmProxy,
        IPoolProxy _poolProxy,
        IPoolPair _lpToken,
        IERC20 _providingToken,
        IERC20 _rewardToken,
        uint _fee) external;
    function changeCanFee(uint _can_id,uint _fee) external;
    function updateCan (uint _can_id) external;
    function mintFor(address _user, uint _can_id, uint _providedAmount) external;
    function burnFor(address _user, uint _can_id, uint _providedAmount, uint _rewardAmount) external;
}