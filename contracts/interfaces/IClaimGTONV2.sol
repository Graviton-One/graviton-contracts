//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";
import "./IBalanceKeeperV2.sol";
import "./IVoterV2.sol";

/// @title The interface for Graviton claim
/// @notice Settles claims of tokens according to the governance balance of users
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IClaimGTONV2 {
    /// @notice User that can grant access permissions and perform privileged actions
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    function setOwner(address _owner) external;

    /// @notice Address of the governance token
    function governanceToken() external view returns (IERC20);

    /// @notice Address of the contract that tracks governance balances
    function balanceKeeper() external view returns (IBalanceKeeperV2);

    /// @notice Address of the voting contract
    function voter() external view returns (IVoterV2);

    /// @notice Address of the wallet from which to withdraw governance tokens
    function wallet() external view returns (address);

    /// @notice Look up if claiming is allowed
    function claimActivated() external view returns (bool);

    /// @notice Look up if the limit on claiming has been activated
    function limitActivated() external view returns (bool);

    /// @notice Look up the beginning the limit term for the `user`
    /// @dev Equal to 0 before the user's first claim
    function lastLimitTimestamp(address user) external view returns (uint256);

    /// @notice The maximum amount of tokens the `user` can claim until the limit term is over
    /// @dev Equal to 0 before the user's first claim
    /// @dev Updates to `limitPercent` of user's balance at the start of the new limit term
    function limitMax(address user) external view returns (uint256);

    /// @notice Sets the address of the voting contract
    function setVoter(IVoterV2 _voter) external;

    /// @notice The maximum amount of tokens available for claiming until the limit term is over
    function setWallet(address _wallet) external;

    /// @notice Sets the permission to claim to `_claimActivated`
    function setClaimActivated(bool _claimActivated) external;

    /// @notice Sets the limit to `_limitActivated`
    function setLimitActivated(bool _limitActivated) external;

    /// @notice Transfers `amount` of governance tokens to the caller
    function claim(uint256 amount) external;

    /// @notice Event emitted when the owner changes via `#setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    /// @notice Event emitted when the voter changes via `#setVoter`.
    /// @param voterOld The previous voting contract
    /// @param voterNew The new voting contract
    event SetVoter(IVoterV2 indexed voterOld, IVoterV2 indexed voterNew);

    /// @notice Event emitted when the wallet changes via `#setWallet`.
    /// @param walletOld The previous wallet
    /// @param walletNew The new wallet
    event SetWallet(address indexed walletOld, address indexed walletNew);

    /// @notice Event emitted when the `sender` claims `amount` of governance tokens
    /// @param sender The account from whose governance balance tokens were claimed
    /// @param receiver The account to which governance tokens were transferred
    /// @dev receiver is always same as sender, kept for compatibility
    /// @param amount The amount of governance tokens claimed
    event Claim(
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );
}
