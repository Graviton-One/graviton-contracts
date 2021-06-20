//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IBalanceKeeperV2.sol";

/// @title The interface for Graviton voting contract
/// @notice Tracks voting rounds according to governance balances of users
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IVoterV2 {
    /// @notice User that can grant access permissions and perform privileged actions
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    function setOwner(address _owner) external;

    /// @notice Address of the contract that tracks governance balances
    function balanceKeeper() external view returns (IBalanceKeeperV2);

    /// @notice Look up if the account can cast votes on behalf of other users
    function canCastVotes(address user) external view returns (bool);

    /// @notice Look up if the account can check voting balances when governance balances diminish
    function canCheck(address user) external view returns (bool);

    /// @notice Sets the permission to cast votes on behalf of other users
    /// @dev Can only be called by the current owner.
    function setCanCastVotes(address caster, bool _canCastVotes) external;

    /// @notice Sets the permission to check voting balances when governance balances diminish
    /// @dev Can only be called by the current owner.
    function setCanCheck(address checker, bool _canCheck) external;

    /// @notice The total number of voting rounds
    function totalRounds() external view returns (uint);

    /// @notice Look up the unique id of one of the active voting rounds
    function activeRounds(uint index) external view returns (uint roundId);

    /// @notice Look up the unique id of one of the finalized voting rounds
    function finalizedRounds(uint index) external view returns (uint roundId);

    /// @notice Look up the name of a voting round
    function roundName(uint roundId) external view returns (string memory);

    /// @notice Look up the name of an option in a voting round
    function optionName(uint roundId, uint optionId)
        external
        view
        returns (string memory);

    /// @notice Look up the total amount of votes for an option in a voting round
    function votesForOption(uint roundId, uint optionId)
        external
        view
        returns (uint);

    /// @notice Look up the amount of votes user sent in a voting round
    function votesInRoundByUser(uint roundId, uint userId)
        external
        view
        returns (uint);

    /// @notice Look up the amount of votes user sent for an option in a voting round
    function votesForOptionByUser(
        uint roundId,
        uint optionId,
        uint userId
    ) external view returns (uint);

    /// @notice Look up if user voted in a voting round
    function userVotedInRound(uint roundId, uint userId)
        external
        view
        returns (bool);

    /// @notice Look up if user voted or an option in a voting round
    function userVotedForOption(
        uint roundId,
        uint optionId,
        uint userId
    ) external view returns (bool);

    /// @notice The total number of users that voted in a voting round
    function totalUsersInRound(uint roundId) external view returns (uint);

    /// @notice The total number of users that voted for an option in a voting round
    function totalUsersForOption(uint roundId, uint optionId)
        external
        view
        returns (uint);

    /// @notice The total number of votes in a voting round
    function votesInRound(uint roundId) external view returns (uint);

    /// @notice The number of active voting rounds
    function totalActiveRounds() external view returns (uint);

    /// @notice The number of finalized voting rounds
    function totalFinalizedRounds() external view returns (uint);

    /// @notice The number of options in a voting round
    function totalRoundOptions(uint roundId) external returns (uint);

    /// @notice Look up if a voting round is active
    function isActiveRound(uint roundId) external view returns (bool);

    /// @notice Look up if a voting round is finalized
    function isFinalizedRound(uint roundId) external view returns (bool);

    /// @notice Starts a voting round
    /// @param _roundName voting round name, i.e. "Proposal"
    /// @param optionNames an array of option names, i.e. ["Approve", "Reject"]
    function startRound(string memory _roundName, string[] memory optionNames) external;

    /// @notice Finalized a voting round
    function finalizeRound(uint roundId) external;

    /// @notice Records votes according to userId governance balance
    /// @param roundId unique id of the voting round
    /// @param votes an array of votes for each option in a voting round, i.e. [7,12]
    /// @dev Can only be called by the account allowed to cast votes on behalf of others
    function castVotes(uint userId, uint roundId, uint[] memory votes) external;

    /// @notice Records votes according to sender's governance balance
    /// @param roundId unique id of the voting round
    /// @param votes an array of votes for each option in a voting round, i.e. [7,12]
    function castVotes(uint roundId, uint[] memory votes) external;

    /// @notice Decreases votes of `user` when their balance is depleted, preserving proportions
    function checkVoteBalances(uint userId) external;

    /// @notice Event emitted when the owner changes via #setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    event SetOwner(address ownerOld, address ownerNew);

    /// @notice Event emitted when the `caster` permission is updated via `#setCanCastVotes`
    /// @param owner The owner account at the time of change
    /// @param caster The account whose permission to cast votes was updated
    /// @param newBool Updated permission
    event SetCanCastVotes(
        address indexed owner,
        address indexed caster,
        bool indexed newBool
    );

    /// @notice Event emitted when the `checker` permission is updated via `#setCanCheck`
    /// @param owner The owner account at the time of change
    /// @param checker The account whose permission to check voting balances was updated
    /// @param newBool Updated permission
    event SetCanCheck(
        address indexed owner,
        address indexed checker,
        bool indexed newBool
    );

    /// @notice Event emitted when a voting round is started via `#startRound`
    /// @param owner The owner account at the time of change
    /// @param totalRounds The total number of voting rounds after the voting round is started
    /// @param roundName The voting round name, i.e. "Proposal"
    /// @param optionNames The array of option names, i.e. ["Approve", "Reject"]
    event StartRound(
        address indexed owner,
        uint totalRounds,
        string roundName,
        string[] optionNames
    );

    /// @notice Event emitted when a voting round is finalized via `#finalizeRound`
    /// @param owner The owner account at the time of change
    /// @param roundId Unique id of the voting round
    event FinalizeRound(address indexed owner, uint roundId);

    /// @notice Event emitted when a user sends votes via `#castVotes`
    /// @param caster The account that cast votes
    /// @param roundId Unique id of the voting round
    /// @param userId The account that cast votes
    /// @param votes Array of votes for each option in the round
    event CastVotes(address caster, uint indexed roundId, uint indexed userId, uint[] votes);

    /// @notice Event emitted when a `checker` decreases a voting balance preserving proportions via `#checkVoteBalances`
    /// @param checker The account that checked the voting balance
    /// @param userId The account whose voting balance was checked
    /// @param newBalance The voting balance after checking
    event CheckVoteBalance(
        address indexed checker,
        uint indexed userId,
        uint newBalance
    );
}
