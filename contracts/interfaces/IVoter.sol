//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title The interface for Graviton voting contract
/// @notice Tracks voting rounds according to governance balances of users
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IVoter {
    /// @notice User that can grant access permissions and perform privileged actions
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    function setOwner(address _owner) external;

    /// @notice Address of the contract that tracks governance balances
    function balanceKeeper() external view returns (address);

    /// @notice Look up if `user` can check voting balances when governance balances diminish
    function canCheck(address user) external view returns (bool);

    /// @notice Sets the permission to check voting balances when governance balances diminish
    /// @dev Can only be called by the current owner.
    function setCanCheck(address checker, bool _canCheck) external;

    /// @notice The total number of voting rounds
    function totalRounds() external view returns (uint256);

    /// @notice Look up the unique id of one of the active voting rounds
    function activeRounds(uint256 index)
        external
        view
        returns (uint256 roundId);

    /// @notice Look up the unique id of one of the finalized voting rounds
    function finalizedRounds(uint256 index)
        external
        view
        returns (uint256 roundId);

    /// @notice Look up the name of a voting round
    function roundName(uint256 roundId) external view returns (string memory);

    /// @notice Look up the name of an option in a voting round
    function roundOptions(uint256 roundId, uint256 optionId)
        external
        view
        returns (string memory);

    /// @notice Look up the total amount of votes for an option in a voting round
    function votesForOption(uint256 roundId, uint256 optionId)
        external
        view
        returns (uint256);

    /// @notice Look up the amount of votes user sent in a voting round
    function votesInRoundByUser(uint256 roundId, address user)
        external
        view
        returns (uint256);

    /// @notice Look up the amount of votes user sent for an option in a voting round
    function votesForOptionByUser(
        uint256 roundId,
        address user,
        uint256 optionId
    ) external view returns (uint256);

    /// @notice Look up if user voted in a voting round
    function userVotedInRound(uint256 roundId, address user)
        external
        view
        returns (bool);

    /// @notice Look up if user voted or an option in a voting round
    function userVotedForOption(
        uint256 roundId,
        uint256 optionId,
        address user
    ) external view returns (bool);

    /// @notice The total number of users that voted in a voting round
    function totalUsersInRound(uint256 roundId) external view returns (uint256);

    /// @notice The total number of users that voted for an option in a voting round
    function totalUsersForOption(uint256 roundId, uint256 optionId)
        external
        view
        returns (uint256);

    /// @notice The total number of votes in a voting round
    function votesInRound(uint256 roundId) external view returns (uint256);

    /// @notice The number of active voting rounds
    function totalActiveRounds() external view returns (uint256);

    /// @notice The number of finalized voting rounds
    function totalFinalizedRounds() external view returns (uint256);

    /// @notice The number of options in a voting round
    function totalRoundOptions(uint256 roundId) external returns (uint256);

    /// @notice Look up if a voting round is active
    function isActiveRound(uint256 roundId) external view returns (bool);

    /// @notice Look up if a voting round is finalized
    function isFinalizedRound(uint256 roundId) external view returns (bool);

    /// @notice Starts a voting round
    /// @param name voting round name, i.e. "Proposal"
    /// @param options an array of option names, i.e. ["Approve", "Reject"]
    function startRound(string memory name, string[] memory options) external;

    /// @notice Finalized a voting round
    function finalizeRound(uint256 roundId) external;

    /// @notice Records votes according to sender's governance balance
    /// @param roundId unique id of the voting round
    /// @param votes an array of votes for each option in a voting round, i.e. [7,12]
    function castVotes(uint256 roundId, uint256[] memory votes) external;

    /// @notice Decreases votes of `user` when their balance is depleted, preserving proportions
    function checkVoteBalances(address user) external;
}
