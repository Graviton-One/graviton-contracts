//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IVoterV2.sol";

/// @title VoterV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract VoterV2 is IVoterV2 {

    /// @inheritdoc IVoterV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    /// @inheritdoc IVoterV2
    IBalanceKeeperV2 public override balanceKeeper;

    /// @inheritdoc IVoterV2
    mapping(address => bool) public override canCastVotes;
    /// @inheritdoc IVoterV2
    mapping(address => bool) public override canCheck;

    struct Option {
        string name;
        mapping(uint => uint) votes;
    }

    struct Round {
        string name;
        uint totalOptions;
        mapping(uint => Option) options;
    }

    mapping(uint => Round) internal rounds;
    mapping(uint => bool) userVoted;
    uint[] users;

    /// @inheritdoc IVoterV2
    uint public override totalRounds;
    /// @inheritdoc IVoterV2
    uint[] public override activeRounds;
    /// @inheritdoc IVoterV2
    uint[] public override finalizedRounds;

    constructor(IBalanceKeeperV2 _balanceKeeper) {
        owner = msg.sender;
        balanceKeeper = _balanceKeeper;
    }
    /// @inheritdoc IVoterV2
    function setOwner(address _owner) external override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IVoterV2
    function setCanCastVotes(address caster, bool _canCastVotes)
        external
        override
        isOwner
    {
        canCastVotes[caster] = _canCastVotes;
        emit SetCanCastVotes(msg.sender, caster, canCastVotes[caster]);
    }

    /// @inheritdoc IVoterV2
    function setCanCheck(address checker, bool _canCheck)
        external
        override
        isOwner
    {
        canCheck[checker] = _canCheck;
        emit SetCanCheck(msg.sender, checker, canCheck[checker]);
    }

    /// @dev getter functions with parameter names
    /// @inheritdoc IVoterV2
    function roundName(uint roundId)
        external
        view
        override
        returns (string memory)
    {
        require(roundId < totalRounds, "no such round");
        return rounds[roundId].name;
    }

    /// @inheritdoc IVoterV2
    function optionName(uint roundId, uint optionId)
        external
        view
        override
        returns (string memory)
    {
        require(roundId < totalRounds, "no such round");
        require(optionId < rounds[roundId].totalOptions, "no such option");
        return rounds[roundId].options[optionId].name;
    }

    /// @inheritdoc IVoterV2
    function totalRoundOptions(uint roundId)
        external
        view
        override
        returns (uint)
    {
        return rounds[roundId].totalOptions;
    }

    /// @inheritdoc IVoterV2
    function votesInRoundByUser(uint roundId, uint userId)
        public
        view
        override
        returns (uint)
    {
        uint sum;
        for (uint i = 0; i < rounds[roundId].totalOptions; i++) {
            sum += rounds[roundId].options[i].votes[userId];
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function votesForOptionByUser(
        uint roundId,
        uint optionId,
        uint userId
    ) public view override returns (uint) {
        return rounds[roundId].options[optionId].votes[userId];
    }

    /// @inheritdoc IVoterV2
    function userVotedInRound(uint roundId, uint userId)
        public
        view
        override
        returns (bool)
    {
        return votesInRoundByUser(roundId, userId) > 0;
    }

    /// @inheritdoc IVoterV2
    function userVotedForOption(
        uint roundId,
        uint optionId,
        uint userId
    ) public view override returns (bool) {
        return votesForOptionByUser(roundId, optionId, userId) > 0;
    }

    /// @inheritdoc IVoterV2
    function totalUsersInRound(uint roundId)
        external
        view
        override
        returns (uint)
    {
        uint sum;
        for (uint i; i < users.length; i++) {
            if (userVotedInRound(roundId, i)) {
                sum++;
            }
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function totalUsersForOption(uint roundId, uint optionId)
        external
        view
        override
        returns (uint)
    {
        uint sum;
        for (uint i; i < users.length; i++) {
            if (userVotedForOption(roundId, optionId, i)) {
                sum++;
            }
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function votesInRound(uint roundId)
        external
        view
        override
        returns (uint)
    {
        uint sum;
        for (uint i; i < rounds[roundId].totalOptions; i++) {
            sum += votesForOption(roundId, i);
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function votesForOption(uint roundId, uint optionId)
        public
        view
        override
        returns (uint)
    {
        uint sum;
        for (uint i = 0; i < users.length; i++) {
            sum += rounds[roundId].options[optionId].votes[users[i]];
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function totalActiveRounds() external view override returns (uint) {
        return activeRounds.length;
    }

    /// @inheritdoc IVoterV2
    function totalFinalizedRounds() external view override returns (uint) {
        return finalizedRounds.length;
    }

    /// @inheritdoc IVoterV2
    function isActiveRound(uint roundId)
        public
        view
        override
        returns (bool)
    {
        for (uint i = 0; i < activeRounds.length; i++) {
            if (activeRounds[i] == roundId) {
                return true;
            }
        }
        return false;
    }

    /// @inheritdoc IVoterV2
    function isFinalizedRound(uint roundId) external view override returns (bool) {
        for (uint i = 0; i < finalizedRounds.length; i++) {
            if (finalizedRounds[i] == roundId) {
                return true;
            }
        }
        return false;
    }

    /// @inheritdoc IVoterV2
    function startRound(string memory _roundName, string[] memory optionNames)
        external
        override
        isOwner
    {
        rounds[totalRounds].name = _roundName;
        for (uint i = 0; i < optionNames.length; i++) {
            rounds[totalRounds].options[i].name = optionNames[i];
            rounds[totalRounds].totalOptions++;
        }
        activeRounds.push(totalRounds);
        totalRounds++;
        emit StartRound(msg.sender, totalRounds, _roundName, optionNames);
    }

    // @dev move roundId from activeRounds to finalizedRounds
    /// @inheritdoc IVoterV2
    function finalizeRound(uint roundId) external override isOwner {
        uint[] memory filteredRounds = new uint[](
            activeRounds.length - 1
        );
        uint j = 0;
        for (uint i = 0; i < activeRounds.length; i++) {
            if (activeRounds[i] == roundId) {
                continue;
            }
            filteredRounds[j] = activeRounds[i];
            j++;
        }
        activeRounds = filteredRounds;
        finalizedRounds.push(roundId);
        emit FinalizeRound(msg.sender, roundId);
    }

    /// @inheritdoc IVoterV2
    function castVotes(uint userId, uint roundId, uint[] memory votes)
        external
        override
    {
        require(canCastVotes[msg.sender], "not allowed to cast votes");
        _castVotes(userId, roundId, votes);
    }

    /// @inheritdoc IVoterV2
    function castVotes(uint roundId, uint[] memory votes)
        external
        override
    {
        uint userId = balanceKeeper.userIdByChainAddress("EVM", abi.encodePacked(msg.sender));
        _castVotes(userId, roundId, votes);
    }

    function _castVotes(uint userId, uint roundId, uint[] memory votes)
        internal
    {
        // @dev fail if roundId is not an active vote
        require(isActiveRound(roundId), "roundId is not an active vote");

        // @dev fail if votes doesn't match number of options in roundId
        require(
            votes.length == rounds[roundId].totalOptions,
            "number of votes doesn't match the number of options"
        );

        uint sum;
        for (uint optionId = 0; optionId < votes.length; optionId++) {
            sum += votes[optionId];
        }

        // @dev fail if balance of sender is smaller than the sum of votes
        require(
            balanceKeeper.balance(userId) >= sum,
            "balance is smaller than the sum of votes"
        );

        // @dev overwrite userId votes
        for (uint i = 0; i < votes.length; i++) {
            rounds[roundId].options[i].votes[userId] = votes[i];
        }
        if (!userVoted[userId] && sum > 0) {
            users.push(userId);
            userVoted[userId] = true;
        }

        emit CastVotes(msg.sender, roundId, userId, votes);
    }

    function checkVoteBalance(
        uint roundId,
        uint userId
    ) internal {
        uint newBalance = balanceKeeper.balance(userId);
        // @dev return if newBalance is still larger than the number of votes
        // @dev return if user didn't vote
        if (newBalance > votesInRoundByUser(roundId, userId) ||
            !userVotedInRound(roundId, userId)) {
            return;
        }
        uint oldSum = votesInRoundByUser(roundId, userId);
        for (uint i = 0; i < rounds[roundId].totalOptions; i++) {
            uint oldVoteBalance = rounds[roundId].options[i].votes[userId];
            uint newVoteBalance = (oldVoteBalance * newBalance) / oldSum;
            rounds[roundId].options[i].votes[userId] = newVoteBalance;
        }
        emit CheckVoteBalance(msg.sender, userId, newBalance);
    }

    /// @inheritdoc IVoterV2
    function checkVoteBalances(uint userId) external override {
        require(
            canCheck[msg.sender],
            "sender is not allowed to check balances"
        );
        for (uint i = 0; i < activeRounds.length; i++) {
            checkVoteBalance(activeRounds[i], userId);
        }
    }
}
