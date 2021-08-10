//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";

/// @title The interface for Graviton OTC contract
/// @notice Exchanges ERC20 token for GTON for with a linear unlocking schedule
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IOTC {
    /// @notice User that can grant access permissions and perform privileged actions
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    function setOwner(address _owner) external;

    /// @notice Address of GTON
    function base() external view returns (IERC20);

    /// @notice Address of ERC20 token to sell GTON for
    function quote() external view returns (IERC20);

    /// @notice amount of quote tokens needed to receive one GTON
    function price() external view returns (uint256);

    /// @notice last time price was updated
    function setPriceLast() external view returns (uint256);

    /// @notice updates price
    function setPrice(uint256 _price) external;

    /// @notice Minimum amount of GTON to exchange
    function lowerLimit() external view returns (uint256);

    /// @notice Maximum amount of GTON to exchange
    function upperLimit() external view returns (uint256);

    /// @notice last time limits were updated
    function setLimitsLast() external view returns (uint256);

    /// @notice updates exchange limits
    function setLimits(uint256 _lowerLimit, uint256 _upperLimit) external;

    /// @notice beginning of vesting period for `account`
    function startTime(address account) external view returns (uint256);

    /// @notice amount of GTON vested for `account`
    function balance(address account) external view returns (uint256);

    /// @notice total amount of vested GTON
    function balanceTotal() external view returns (uint256);

    /// @notice amount of GTON claimed by `account`
    function claimed(address account) external view returns (uint256);

    /// @notice last time GTON was claimed by `account`
    function claimLast(address account) external view returns (uint256);

    /// @notice exchanges quote tokens for vested GTON according to a set price
    /// @param amount amount of GTON to exchange
    function exchange(uint256 amount) external;

    /// @notice transfers a share of vested GTON to the caller
    function claim() external;

    /// @notice transfers quote tokens to the owner
    function collect() external;

    /// @notice Event emitted when the owner changes via `#setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    /// @notice Event emitted when the owner updates the price via `#setPrice`.
    /// @param _price amount of quote tokens needed to receive one GTON
    event SetPrice(uint256 _price);

    /// @notice Event emitted when the owner updates exchange limits via `#setLimits`.
    /// @param _lowerLimit minimum amount of GTON to exchange
    /// @param _upperLimit maximum amount of GTON to exchange
    event SetLimits(uint256 _lowerLimit, uint256 _upperLimit);

    /// @notice Event emitted when OTC exchange is initiated via `#exchange`.
    /// @param account account that initiated the exchange
    /// @param amountQuote amount of quote tokens that `account`
    /// transfers to the contract
    /// @param amountBase amount of GTON vested for `account`
    /// in exchange for quote tokens
    event Exchange(address account, uint256 amountQuote, uint256 amountBase);

    /// @notice Event emitted when an account claims vested GTON via `#Claim`.
    /// @param account account that initiates OTC exchange
    /// @param amount amount of base tokens that the account claims
    event Claim(address account, uint256 amount);

    /// @notice Event emitted when the owner collects quote tokens via `#Collect`.
    /// @param amount amount of quote tokens that the owner collects
    event Collect(uint256 amount);
}
