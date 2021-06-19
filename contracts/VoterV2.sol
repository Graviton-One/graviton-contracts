//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IBalanceKeeperV2.sol";
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
    address public override balanceKeeper;

    /// @inheritdoc IVoterV2
    uint256 public override totalRounds;
    /// @inheritdoc IVoterV2
    uint256[] public override activeRounds;
    /// @inheritdoc IVoterV2
    uint256[] public override finalizedRounds;
    mapping(uint256 => string) internal _roundName;
    mapping(uint256 => string[]) internal _roundOptions;

    mapping(uint256 => uint256[]) internal _votesForOption;

    mapping(uint256 => mapping(address => uint256))
        internal _votesInRoundByUser;
    mapping(uint256 => mapping(address => uint256[]))
        internal _votesForOptionByUser;

    mapping(uint256 => mapping(address => bool)) internal _userVotedInRound;
    mapping(uint256 => mapping(uint256 => mapping(address => bool)))
        internal _userVotedForOption;

    mapping(uint256 => uint256) internal _totalUsersInRound;
    mapping(uint256 => mapping(uint256 => uint256))
        internal _totalUsersForOption;

    /// @inheritdoc IVoterV2
    mapping(address => bool) public override canCheck;

    constructor(address _balanceKeeper) {
        owner = msg.sender;
        balanceKeeper = _balanceKeeper;
    }
    /// @inheritdoc IVoterV2
    function setOwner(address _owner) public override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @dev getter functions with parameter names
    /// @inheritdoc IVoterV2
    function roundName(uint256 roundId)
        public
        view
        override
        returns (string memory)
    {
        return _roundName[roundId];
    }

    /// @inheritdoc IVoterV2
    function roundOptions(uint256 roundId, uint256 optionId)
        public
        view
        override
        returns (string memory)
    {
        return _roundOptions[roundId][optionId];
    }

    /// @inheritdoc IVoterV2
    function votesForOption(uint256 roundId, uint256 optionId)
        public
        view
        override
        returns (uint256)
    {
        return _votesForOption[roundId][optionId];
    }

    /// @inheritdoc IVoterV2
    function votesInRoundByUser(uint256 roundId, address user)
        public
        view
        override
        returns (uint256)
    {
        return _votesInRoundByUser[roundId][user];
    }

    /// @inheritdoc IVoterV2
    function votesForOptionByUser(
        uint256 roundId,
        address user,
        uint256 optionId
    ) public view override returns (uint256) {
        return _votesForOptionByUser[roundId][user][optionId];
    }

    /// @inheritdoc IVoterV2
    function userVotedInRound(uint256 roundId, address user)
        public
        view
        override
        returns (bool)
    {
        return _userVotedInRound[roundId][user];
    }

    /// @inheritdoc IVoterV2
    function userVotedForOption(
        uint256 roundId,
        uint256 optionId,
        address user
    ) public view override returns (bool) {
        return _userVotedForOption[roundId][optionId][user];
    }

    /// @inheritdoc IVoterV2
    function totalUsersInRound(uint256 roundId)
        public
        view
        override
        returns (uint256)
    {
        return _totalUsersInRound[roundId];
    }

    /// @inheritdoc IVoterV2
    function totalUsersForOption(uint256 roundId, uint256 optionId)
        public
        view
        override
        returns (uint256)
    {
        return _totalUsersForOption[roundId][optionId];
    }

    /// @inheritdoc IVoterV2
    function votesInRound(uint256 roundId)
        public
        view
        override
        returns (uint256)
    {
        uint256 sum;
        for (
            uint256 optionId = 0;
            optionId < _votesForOption[roundId].length;
            optionId++
        ) {
            sum += _votesForOption[roundId][optionId];
        }
        return sum;
    }

    /// @inheritdoc IVoterV2
    function totalActiveRounds() public view override returns (uint256) {
        return activeRounds.length;
    }

    /// @inheritdoc IVoterV2
    function totalFinalizedRounds() public view override returns (uint256) {
        return finalizedRounds.length;
    }

    /// @inheritdoc IVoterV2
    function totalRoundOptions(uint256 roundId)
        public
        view
        override
        returns (uint256)
    {
        uint256 sum;
        for (uint256 i = 0; i < _roundOptions[roundId].length; i++) {
            sum++;
        }
        return sum;
    }


    /// @inheritdoc IVoterV2
    function startRound(string memory name, string[] memory options)
        public
        override
        isOwner
    {
        _roundName[totalRounds] = name;
        _roundOptions[totalRounds] = options;
        _votesForOption[totalRounds] = new uint256[](options.length);
        activeRounds.push(totalRounds);
        totalRounds++;
        emit StartRound(msg.sender, totalRounds, name, options);
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
    function isFinalizedRound(uint256 roundId) public view override returns (bool) {
        for (uint256 i = 0; i < finalizedRounds.length; i++) {
            if (finalizedRounds[i] == roundId) {
                return true;
            }
        }
        return false;
    }

    /// @inheritdoc IVoterV2
    function castVotes(uint256 roundId, uint256[] memory votes)
        public
        override
    {
        // @dev fail if roundId is not an active vote
        require(isActiveRound(roundId), "roundId is not an active vote");

        // @dev fail if votes doesn't match number of options in roundId
        require(
            votes.length == _roundOptions[roundId].length,
            "number of votes doesn't match number of options"
        );

        // @dev fail if balance of sender is smaller than the sum of votes
        uint256 sum;
        for (uint256 optionId = 0; optionId < votes.length; optionId++) {
            sum += votes[optionId];
        }
        require(
            IBalanceKeeperV2(balanceKeeper).balance(
                "EVM",
                abi.encodePacked(msg.sender)
            ) >= sum,
            "balance is smaller than the sum of votes"
        );

        // @dev if msg.sender already voted in roundId, erase their previous votes
        if (_votesInRoundByUser[roundId][msg.sender] != 0) {
            uint256[] memory oldVotes = _votesForOptionByUser[roundId][
                msg.sender
            ];
            for (uint256 optionId = 0; optionId < oldVotes.length; optionId++) {
                _votesForOption[roundId][optionId] -= oldVotes[optionId];
            }
        }

        // @dev update sender's votes
        _votesForOptionByUser[roundId][msg.sender] = votes;

        for (uint256 optionId = 0; optionId < votes.length; optionId++) {
            if (
                !_userVotedForOption[roundId][optionId][msg.sender] &&
                votes[optionId] != 0
            ) {
                _userVotedForOption[roundId][optionId][msg.sender] = true;
                _totalUsersForOption[roundId][optionId]++;
            }

            if (
                _userVotedForOption[roundId][optionId][msg.sender] &&
                votes[optionId] == 0
            ) {
                _userVotedForOption[roundId][optionId][msg.sender] = false;
                _totalUsersForOption[roundId][optionId]--;
            }

            _votesForOption[roundId][optionId] += votes[optionId];
        }

        _votesInRoundByUser[roundId][msg.sender] = sum;

        if (!_userVotedInRound[roundId][msg.sender] && sum != 0) {
            _userVotedInRound[roundId][msg.sender] = true;
            _totalUsersInRound[roundId]++;
        }
        if (_userVotedInRound[roundId][msg.sender] && sum == 0) {
            _userVotedInRound[roundId][msg.sender] = false;
            _totalUsersInRound[roundId]--;
        }

        emit CastVotes(msg.sender, roundId);
    }

    /// @inheritdoc IVoterV2
    function setCanCheck(address checker, bool _canCheck)
        public
        override
        isOwner
    {
        canCheck[checker] = _canCheck;
        emit SetCanCheck(msg.sender, checker, canCheck[checker]);
    }

    function checkVoteBalance(
        uint256 roundId,
        address user,
        uint256 newBalance
    ) internal {
        // @dev return if newBalance is still larger than the number of votes
        // @dev return if user didn't vote
        if (
            newBalance > _votesInRoundByUser[roundId][user] ||
            _votesInRoundByUser[roundId][user] == 0
        ) {
            return;
        }
        uint256[] storage oldVotes = _votesForOptionByUser[roundId][user];
        uint256 newSum;
        for (uint256 optionId = 0; optionId < oldVotes.length; optionId++) {
            uint256 oldVoteBalance = oldVotes[optionId];
            uint256 newVoteBalance = (oldVoteBalance * newBalance) /
                _votesInRoundByUser[roundId][user];
            _votesForOption[roundId][optionId] -= (oldVoteBalance -
                newVoteBalance);
            _votesForOptionByUser[roundId][user][optionId] = newVoteBalance;
            newSum += newVoteBalance;
        }
        _votesInRoundByUser[roundId][user] = newSum;
    }

    /// @inheritdoc IVoterV2
    function checkVoteBalances(address user) public override {
        require(
            canCheck[msg.sender],
            "sender is not allowed to check balances"
        );
        uint256 newBalance = IBalanceKeeperV2(balanceKeeper).balance(
            "EVM",
            abi.encodePacked(msg.sender)
        );
        for (uint256 i = 0; i < activeRounds.length; i++) {
            checkVoteBalance(activeRounds[i], user, newBalance);
        }
        emit CheckVoteBalances(msg.sender, user, newBalance);
    }

    // @dev move roundId from activeRounds to finalizedRounds
    /// @inheritdoc IVoterV2
    function finalizeRound(uint256 roundId) public override isOwner {
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
}
