//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";
import "./IBalanceKeeperV2.sol";
import "./IVoter.sol";

interface IClaimGTONV2 {
    function owner() external view returns (address);
    function governanceToken() external view returns (IERC20);
    function balanceKeeper() external view returns (IBalanceKeeperV2);
    function voter() external view returns (IVoter);
    function wallet() external view returns (address);
    function claimActivated() external view returns (bool);
    function limitActivated() external view returns (bool);
    function lastLimitTimestamp(address user) external view returns (uint);
    function limitMax(address user) external view returns(uint);
    function setOwner(address _owner) external;
    function setWallet(address _wallet) external;
    function setVoter(IVoter _voter) external;
    function setGovernanceToken(IERC20 _governanceToken) external;
    function setBalanceKeeper(IBalanceKeeperV2 _balanceKeeper) external;
    function setClaimActivated(bool _claimActivated) external;
    function setLimitActivated(bool _limitActivated) external;
    function claim(uint amount, address to) external;
}
