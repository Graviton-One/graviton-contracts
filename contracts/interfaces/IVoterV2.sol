//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IBalanceKeeperV2.sol";

/// @title The interface for Graviton voting contract
/// @notice Tracks voting rounds according to governance balances of users
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IVoterV2 {
    /// @notice User that can grant access permissions and perform privileged actions
    /// @dev 0x8da5cb5b
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    /// @dev 0x13af4035
    function setOwner(address _owner) external;

    /// @notice Address of the contract that tracks governance balances
    /// @dev 0xfd44f921
    function balanceKeeper() external view returns (IBalanceKeeperV2);

    /// @notice Look up if the account can cast votes on behalf of other users
    /// @dev 0x081dca92
    function canCastVotes(address user) external view returns (bool);

    /// @notice Look up if the account can check voting balances when governance balances diminish
    /// @dev 0x7cabca66
    function canCheck(address user) external view returns (bool);

    /// @notice Sets the permission to cast votes on behalf of other users
    /// @dev Can only be called by the current owner.
    /// @dev 0x730dc1a3
    function setCanCastVotes(address caster, bool _canCastVotes) external;

    /// @notice Sets the permission to check voting balances when governance balances diminish
    /// @dev Can only be called by the current owner.
    /// @dev 0x98925d30
    function setCanCheck(address checker, bool _canCheck) external;

    /// @notice The total number of voting rounds
    /// @dev 0x8a568299
    function totalRounds() external view returns (uint256);

    /// @notice Look up the unique id of one of the active voting rounds
    /// @dev 0x2292e3af
    function activeRounds(uint256 index)
        external
        view
        returns (uint256 roundId);

    /// @notice Look up the unique id of one of the finalized voting rounds
    /// @dev 0xf0a8297e
    function finalizedRounds(uint256 index)
        external
        view
        returns (uint256 roundId);

    /// @notice Look up the name of a voting round
    /// @dev 0x9debf9c1
    function roundName(uint256 roundId) external view returns (string memory);

    /// @notice Look up the name of an option in a voting round
    /// @dev 0xeaac697a
    function optionName(uint256 roundId, uint256 optionId)
        external
        view
        returns (string memory);

    /// @notice Look up the total amount of votes for an option in a voting round
    /// @dev 0x6e07e221
    function votesForOption(uint256 roundId, uint256 optionId)
        external
        view
        returns (uint256);

    /// @notice Look up the amount of votes user sent in a voting round
    /// @dev 0x4d89f980
    function votesInRoundByUser(uint256 roundId, uint256 userId)
        external
        view
        returns (uint256);

    /// @notice Look up the amount of votes user sent for an option in a voting round
    /// @dev 0xe0c22e86
    function votesForOptionByUser(
        uint256 roundId,
        uint256 optionId,
        uint256 userId
    ) external view returns (uint256);

    /// @notice Look up if user voted in a voting round
    /// @dev 0xb59952a2
    function userVotedInRound(uint256 roundId, uint256 userId)
        external
        view
        returns (bool);

    /// @notice Look up if user voted or an option in a voting round
    /// @dev 0xbde9fe72
    function userVotedForOption(
        uint256 roundId,
        uint256 optionId,
        uint256 userId
    ) external view returns (bool);

    /// @notice The total number of users that voted in a voting round
    /// @dev 0xfae67735
    function totalUsersInRound(uint256 roundId) external view returns (uint256);

    /// @notice The total number of users that voted for an option in a voting round
    /// @dev 0x3abe0c6a
    function totalUsersForOption(uint256 roundId, uint256 optionId)
        external
        view
        returns (uint256);

    /// @notice The total number of votes in a voting round
    /// @dev 0x1a29f1b4
    function votesInRound(uint256 roundId) external view returns (uint256);

    /// @notice The number of active voting rounds
    /// @dev 0xf9cce505
    function totalActiveRounds() external view returns (uint256);

    /// @notice The number of finalized voting rounds
    /// @dev 0xa2e0cb2b
    function totalFinalizedRounds() external view returns (uint256);

    /// @notice The number of options in a voting round
    /// @dev 0x67532670
    function totalRoundOptions(uint256 roundId) external returns (uint256);

    /// @notice Look up if a voting round is active
    /// @dev 0x66abc2a6
    function isActiveRound(uint256 roundId) external view returns (bool);

    /// @notice Look up if a voting round is finalized
    /// @dev 0x8c802f0c
    function isFinalizedRound(uint256 roundId) external view returns (bool);

    /// @notice Starts a voting round
    /// @param _roundName voting round name, i.e. "Proposal"
    /// @param optionNames an array of option names, i.e. ["Approve", "Reject"]
    /// @dev 0xad77c86a
    function startRound(string memory _roundName, string[] memory optionNames)
        external;

    /// @notice Finalized a voting round
    /// @dev 0x3469f6e2
    function finalizeRound(uint256 roundId) external;

    /// @notice Records votes according to userId governance balance
    /// @param roundId unique id of the voting round
    /// @param votes an array of votes for each option in a voting round, i.e. [7,12]
    /// @dev Can only be called by the account allowed to cast votes on behalf of others
    /// @dev 0xe361f07f
    function castVotes(
        uint256 userId,
        uint256 roundId,
        uint256[] memory votes
    ) external;

    /// @notice Records votes according to sender's governance balance
    /// @param roundId unique id of the voting round
    /// @param votes an array of votes for each option in a voting round, i.e. [7,12]
    /// @dev 0x44083843
    function castVotes(uint256 roundId, uint256[] memory votes) external;

    /// @notice Decreases votes of `user` when their balance is depleted, preserving proportions
    /// @dev 0xebce8e5a
    function checkVoteBalances(uint256 userId) external;

    /// @notice Event emitted when the owner changes via `#setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    /// @dev 0xcbf985117192c8f614a58aaf97226bb80a754772f5f6edf06f87c675f2e6c663
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    /// @notice Event emitted when the `caster` permission is updated via `#setCanCastVotes`
    /// @param owner The owner account at the time of change
    /// @param caster The account whose permission to cast votes was updated
    /// @param newBool Updated permission
    /// @dev 0xfb3bc4219a56f26314da817cfc2d275075df8efc289db884e65b8d08dc8b1551
    event SetCanCastVotes(
        address indexed owner,
        address indexed caster,
        bool indexed newBool
    );

    /// @notice Event emitted when the `checker` permission is updated via `#setCanCheck`
    /// @param owner The owner account at the time of change
    /// @param checker The account whose permission to check voting balances was updated
    /// @param newBool Updated permission
    /// @dev 0xbe36b0226217340762183bac9b95c087d57582fa89fe1f558bdcae4f01ca5c52
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
    /// @dev 0x5e1a5715172c93eabac8e43d1d6d25a16666a54bdbe86ad319d89bcaa52f11fb
    event StartRound(
        address indexed owner,
        uint256 totalRounds,
        string roundName,
        string[] optionNames
    );

    /// @notice Event emitted when a voting round is finalized via `#finalizeRound`
    /// @param owner The owner account at the time of change
    /// @param roundId Unique id of the voting round
    /// @dev 0x2237c4c7f7b065c0962407d5e7a8e049fb9f76823365bc367a6c276756490ed6
    event FinalizeRound(address indexed owner, uint256 indexed roundId);

    /// @notice Event emitted when a user sends votes via `#castVotes`
    /// @param caster The account that cast votes
    /// @param roundId Unique id of the voting round
    /// @param userId The account that cast votes
    /// @param votes Array of votes for each option in the round
    /// @dev 0xb0203c31371583d54e7dd44f55f6a78e3ef2964a045dbe15ea4b47ba2a4814af
    event CastVotes(
        address indexed caster,
        uint256 indexed roundId,
        uint256 indexed userId,
        uint256[] votes
    );

    /// @notice Event emitted when a `checker` decreases a voting balance preserving proportions via `#checkVoteBalances`
    /// @param checker The account that checked the voting balance
    /// @param userId The account whose voting balance was checked
    /// @param newBalance The voting balance after checking
    /// @dev 0xc6a27c61104a378462b1fd982971d5cc85a9d2300e9aa0636396643b54c64762
    event CheckVoteBalance(
        address indexed checker,
        uint256 indexed userId,
        uint256 newBalance
    );
}
