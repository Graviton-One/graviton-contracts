//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";

/// @title The interface for Graviton OTC contract
/// @notice Exchanges ERC20 token for GTON with a linear unlocking schedule
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

    /// @notice Look up if `user` is allowed to set price
    function canSetPrice(address user) external view returns (bool);

    /// @notice Sets `setter` permission to open new governance balances to `_canSetPrice`
    /// @dev Can only be called by the current owner.
    function setCanSetPrice(address setter, bool _canSetPrice) external;

    /// @notice Minimum amount of GTON to exchange
    function lowerLimit() external view returns (uint256);

    /// @notice Maximum amount of GTON to exchange
    function upperLimit() external view returns (uint256);

    /// @notice last time limits were updated
    function setLimitsLast() external view returns (uint256);

    /// @notice updates exchange limits
    function setLimits(uint256 _lowerLimit, uint256 _upperLimit) external;

    /// @notice claim starting time to set for otc deals
    function cliffAdmin() external view returns (uint256);

    /// @notice total vesting period to set for otc deals
    function vestingTimeAdmin() external view returns (uint256);

    /// @notice number of claims over vesting period to set for otc deals
    function numberOfTranchesAdmin() external view returns (uint256);

    /// @notice last time vesting parameters were updated
    function setVestingParamsLast() external view returns (uint256);

    /// @notice updates vesting parameters
    /// @param _cliff claim starting time
    /// @param _vestingTimeAdmin total vesting period
    /// @param _numberOfTranchesAdmin number of claims over vesting period
    function setVestingParams(
        uint256 _cliff,
        uint256 _vestingTimeAdmin,
        uint256 _numberOfTranchesAdmin
    ) external;

    /// @notice beginning of vesting period for `account`
    function startTime(address account) external view returns (uint256);

    /// @notice claim starting time set for otc deal with `account`
    function cliff(address account) external view returns (uint256);

    /// @notice total vesting period set for otc deal with `account`
    function vestingTime(address account) external view returns (uint256);

    /// @notice number of claims over vesting period set for otc deal with `account`
    function numberOfTranches(address account) external view returns (uint256);

    /// @notice amount of GTON vested for `account`
    function vested(address account) external view returns (uint256);

    /// @notice amount of GTON claimed by `account`
    function claimed(address account) external view returns (uint256);

    /// @notice last time GTON was claimed by `account`
    function claimLast(address account) external view returns (uint256);

    /// @notice total amount of vested GTON
    function vestedTotal() external view returns (uint256);

    /// @notice amount of GTON claimed by all accounts
    function claimedTotal() external view returns (uint256);

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

    /// @notice Event emitted when the `setter` permission is updated via `#setCanSetPrice`
    /// @param owner The owner account at the time of change
    /// @param setter The account whose permission to set price was updated
    /// @param newBool Updated permission
    event SetCanSetPrice(
        address indexed owner,
        address indexed setter,
        bool indexed newBool
    );

    /// @notice Event emitted when the owner updates exchange limits via `#setLimits`.
    /// @param _lowerLimit minimum amount of GTON to exchange
    /// @param _upperLimit maximum amount of GTON to exchange
    event SetLimits(uint256 _lowerLimit, uint256 _upperLimit);

    /// @notice Event emitted when the owner updates vesting parameters via `#setVestingParams`.
    /// @param _cliffAdmin claim starting time to set for otc deals
    /// @param _vestingTimeAdmin total vesting period to set for otc deals
    /// @param _numberOfTranchesAdmin number of tranches to set for otc deals
    event SetVestingParams(uint256 _cliffAdmin, uint256 _vestingTimeAdmin, uint256 _numberOfTranchesAdmin);

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
