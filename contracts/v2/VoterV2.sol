//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IVoterV2.sol";

/// @title VoterV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract VoterV2 is IVoterV2 {
    /// @inheritdoc IVoterV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "ACW");
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
        mapping(uint256 => uint256) votes;
    }

    struct Round {
        string name;
        uint256 totalOptions;
        mapping(uint256 => Option) options;
    }

    mapping(uint256 => Round) internal rounds;
    mapping(uint256 => bool) userVoted;
    uint256[] public users;

    /// @inheritdoc IVoterV2
    uint256 public override totalRounds;
    /// @inheritdoc IVoterV2
    uint256[] public override activeRounds;
    /// @inheritdoc IVoterV2
    uint256[] public override finalizedRounds;

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
    function roundName(uint256 roundId)
        external
        view
        override
        returns (string memory)
    {
        require(roundId < totalRounds, "V1");
        return rounds[roundId].name;
    }

    /// @inheritdoc IVoterV2
    function optionName(uint256 roundId, uint256 optionId)
        external
        view
        override
        returns (string memory)
    {
        require(roundId < totalRounds, "V1");
        require(optionId < rounds[roundId].totalOptions, "V2");
        return rounds[roundId].options[optionId].name;
    }

    /// @inheritdoc IVoterV2
    function totalRoundOptions(uint256 roundId)
        external
        view
        override
        returns (uint256)
    {
        return rounds[roundId].totalOptions;
    }

    /// @inheritdoc IVoterV2
    function votesForOptionByUser(
        uint256 roundId,
        uint256 optionId,
        uint256 userId
    ) public view override returns (uint256) {
        return rounds[roundId].options[optionId].votes[userId];
    }

    /// @inheritdoc IVoterV2
    function votesInRoundByUser(uint256 roundId, uint256 userId)
        public
        view
        override
        returns (uint256)
    {
        uint256 sum;
        for (uint256 i = 0; i < rounds[roundId].totalOptions; i++) {
            sum += votesForOptionByUser(roundId, i, userId);
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function userVotedInRound(uint256 roundId, uint256 userId)
        public
        view
        override
        returns (bool)
    {
        return votesInRoundByUser(roundId, userId) > 0;
    }

    /// @inheritdoc IVoterV2
    function userVotedForOption(
        uint256 roundId,
        uint256 optionId,
        uint256 userId
    ) public view override returns (bool) {
        return votesForOptionByUser(roundId, optionId, userId) > 0;
    }

    /// @inheritdoc IVoterV2
    function totalUsersInRound(uint256 roundId)
        external
        view
        override
        returns (uint256)
    {
        uint256 sum;
        for (uint256 i; i < users.length; i++) {
            if (userVotedInRound(roundId, users[i])) {
                sum++;
            }
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function totalUsersForOption(uint256 roundId, uint256 optionId)
        external
        view
        override
        returns (uint256)
    {
        uint256 sum;
        for (uint256 i; i < users.length; i++) {
            if (userVotedForOption(roundId, optionId, users[i])) {
                sum++;
            }
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function votesForOption(uint256 roundId, uint256 optionId)
        public
        view
        override
        returns (uint256)
    {
        uint256 sum;
        for (uint256 i = 0; i < users.length; i++) {
            sum += votesForOptionByUser(roundId, optionId, users[i]);
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function votesInRound(uint256 roundId)
        external
        view
        override
        returns (uint256)
    {
        uint256 sum;
        for (uint256 i; i < rounds[roundId].totalOptions; i++) {
            sum += votesForOption(roundId, i);
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function totalActiveRounds() external view override returns (uint256) {
        return activeRounds.length;
    }

    /// @inheritdoc IVoterV2
    function totalFinalizedRounds() external view override returns (uint256) {
        return finalizedRounds.length;
    }

    /// @inheritdoc IVoterV2
    function isActiveRound(uint256 roundId)
        public
        view
        override
        returns (bool)
    {
        for (uint256 i = 0; i < activeRounds.length; i++) {
            if (activeRounds[i] == roundId) {
                return true;
            }
        }
        return false;
    }

    /// @inheritdoc IVoterV2
    function isFinalizedRound(uint256 roundId)
        external
        view
        override
        returns (bool)
    {
        for (uint256 i = 0; i < finalizedRounds.length; i++) {
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
        for (uint256 i = 0; i < optionNames.length; i++) {
            rounds[totalRounds].options[i].name = optionNames[i];
            rounds[totalRounds].totalOptions++;
        }
        activeRounds.push(totalRounds);
        totalRounds++;
        emit StartRound(msg.sender, totalRounds, _roundName, optionNames);
    }

    // @dev move roundId from activeRounds to finalizedRounds
    /// @inheritdoc IVoterV2
    function finalizeRound(uint256 roundId) external override isOwner {
        uint256[] memory filteredRounds = new uint256[](
            activeRounds.length - 1
        );
        uint256 j = 0;
        for (uint256 i = 0; i < activeRounds.length; i++) {
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
    function castVotes(
        uint256 userId,
        uint256 roundId,
        uint256[] memory votes
    ) external override {
        require(canCastVotes[msg.sender], "ACV");
        _castVotes(userId, roundId, votes);
    }

    /// @inheritdoc IVoterV2
    function castVotes(uint256 roundId, uint256[] memory votes)
        external
        override
    {
        uint256 userId = balanceKeeper.userIdByChainAddress(
            "EVM",
            abi.encodePacked(msg.sender)
        );
        _castVotes(userId, roundId, votes);
    }

    function _castVotes(
        uint256 userId,
        uint256 roundId,
        uint256[] memory votes
    ) internal {
        // @dev fail if roundId is not an active vote
        require(isActiveRound(roundId), "V3");

        // @dev fail if votes doesn't match number of options in roundId
        require(votes.length == rounds[roundId].totalOptions, "V4");

        uint256 sum;
        for (uint256 optionId = 0; optionId < votes.length; optionId++) {
            sum += votes[optionId];
        }

        // @dev fail if balance of sender is smaller than the sum of votes
        require(balanceKeeper.balance(userId) >= sum, "V5");

        // @dev overwrite userId votes
        for (uint256 i = 0; i < votes.length; i++) {
            rounds[roundId].options[i].votes[userId] = votes[i];
        }
        if (!userVoted[userId] && sum > 0) {
            users.push(userId);
            userVoted[userId] = true;
        }

        emit CastVotes(msg.sender, roundId, userId, votes);
    }

    function checkVoteBalance(uint256 roundId, uint256 userId) internal {
        uint256 newBalance = balanceKeeper.balance(userId);
        // @dev return if newBalance is still larger than the number of votes
        // @dev return if user didn't vote
        if (
            newBalance > votesInRoundByUser(roundId, userId) ||
            !userVotedInRound(roundId, userId)
        ) {
            return;
        }
        uint256 oldSum = votesInRoundByUser(roundId, userId);
        for (uint256 i = 0; i < rounds[roundId].totalOptions; i++) {
            uint256 oldVoteBalance = rounds[roundId].options[i].votes[userId];
            uint256 newVoteBalance = (oldVoteBalance * newBalance) / oldSum;
            rounds[roundId].options[i].votes[userId] = newVoteBalance;
        }
        emit CheckVoteBalance(msg.sender, userId, newBalance);
    }

    /// @inheritdoc IVoterV2
    function checkVoteBalances(uint256 userId) external override {
        require(canCheck[msg.sender], "ACC");
        for (uint256 i = 0; i < activeRounds.length; i++) {
            checkVoteBalance(activeRounds[i], userId);
        }
    }
}
