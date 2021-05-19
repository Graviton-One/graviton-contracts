//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface Balance {
    function userBalance(address user) external returns (uint);

}

/// @title Voter
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract Voter {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    address public balanceKeeper;

    uint public roundCount;
    uint[] public activeRounds;
    uint[] public pastRounds;
    mapping(uint => string) internal _roundName;
    mapping(uint => string[]) internal _roundOptions;

    mapping(uint => uint[]) internal _votesForOption;

    mapping(uint => mapping(address => uint)) internal _votesInRoundByUser;
    mapping(uint => mapping(address => uint[])) internal _votesForOptionByUser;

    mapping(uint => mapping(address => bool)) internal _userVotedInRound;
    mapping(uint => mapping(uint => mapping(address => bool))) internal _userVotedForOption;

    mapping(uint => uint) internal _userCountInRound;
    mapping(uint => mapping(uint => uint)) internal _userCountForOption;

    mapping(address => bool) public allowedCheckers;

    event CastVotesEvent(address voter, uint roundId);

    constructor(address _owner, address _balanceKeeper) {
        owner = _owner;
        balanceKeeper = _balanceKeeper;
    }

    // getter functions with parameter names
    function roundName(uint roundId) public view returns (string memory) {
        return _roundName[roundId];
    }
    function roundOptions(uint roundId, uint optionId) public view returns (string memory) {
        return _roundOptions[roundId][optionId];
    }
    function votesForOption(uint roundId, uint optionId) public view returns (uint) {
        return _votesForOption[roundId][optionId];
    }
    function votesInRoundByUser(uint roundId, address user) public view returns (uint) {
        return _votesInRoundByUser[roundId][user];
    }
    function votesForOptionByUser(uint roundId, address user, uint optionId) public view returns (uint) {
        return _votesForOptionByUser[roundId][user][optionId];
    }

    // sum of all votes in a round
    function votesInRound(uint roundId) public view returns (uint) {
        uint sum;
        for (uint optionId = 0; optionId < _votesForOption[roundId].length; optionId++) {
            sum += _votesForOption[roundId][optionId];
        }
        return sum;
    }

    // number of сurrently active rounds
    function activeRoundCount() public view returns (uint) {
        return activeRounds.length;
    }
    function pastRoundCount() public view returns (uint) {
        return pastRounds.length;
    }

    // number of options in a round
    function roundOptionCount(uint roundId) public view returns(uint) {
        uint sum;
        for (uint i = 0; i < _roundOptions[roundId].length; i++) {
            sum ++;
        }
        return sum;
    }

    function userVotedInRound(uint roundId, address user) public view returns(bool) {
        return _userVotedInRound[roundId][user];
    }

    function userVotedForOption(uint roundId, uint optionId, address user) public view returns(bool) {
        return _userVotedForOption[roundId][optionId][user];
    }

    function userCountInRound(uint roundId) public view returns(uint) {
        return _userCountInRound[roundId];
    }

    function userCountForOption(uint roundId, uint optionId) public view returns(uint) {
        return _userCountForOption[roundId][optionId];
    }

    function transferOwnership(address newOwner) public isOwner {
        owner = newOwner;
    }

    function startRound(string memory name, string[] memory options) public isOwner {
        _roundName[roundCount] = name;
        _roundOptions[roundCount] = options;
        _votesForOption[roundCount] = new uint[](options.length);
        activeRounds.push(roundCount);
        roundCount++;
    }

    function isActiveRound(uint roundId) public view returns (bool) {
        for(uint i = 0; i < activeRounds.length; i++) {
            if (activeRounds[i] == roundId) {
                return true;
            }
        }
        return false;
    }

    function castVotes(uint roundId, uint[] memory votes) public {

        // fail if roundId is not an active vote
        require(isActiveRound(roundId),"roundId is not an active vote");

        // fail if votes doesn't match number of options in roundId
        require(votes.length == _roundOptions[roundId].length, "number of votes doesn't match number of options");

        // fail if balance of sender is smaller than the sum of votes
        uint sum;
        for (uint optionId = 0; optionId < votes.length; optionId++) {
            sum += votes[optionId];
        }
        require(Balance(balanceKeeper).userBalance(msg.sender) >= sum,"balance is smaller than the sum of votes");

        // if msg.sender already voted in roundId, erase their previous votes
        if (_votesInRoundByUser[roundId][msg.sender] != 0) {
            uint[] memory oldVotes = _votesForOptionByUser[roundId][msg.sender];
            for (uint optionId = 0; optionId < oldVotes.length; optionId++) {
                _votesForOption[roundId][optionId] -= oldVotes[optionId];
            }
        }

        // update sender's votes
        _votesForOptionByUser[roundId][msg.sender] = votes;

        for (uint optionId = 0; optionId < votes.length; optionId++) {

            if (!_userVotedForOption[roundId][optionId][msg.sender] && votes[optionId] != 0) {
                _userVotedForOption[roundId][optionId][msg.sender] = true;
                _userCountForOption[roundId][optionId]++;
            }

            if (_userVotedForOption[roundId][optionId][msg.sender] && votes[optionId] == 0) {
                _userVotedForOption[roundId][optionId][msg.sender] = false;
                _userCountForOption[roundId][optionId]--;
            }

            _votesForOption[roundId][optionId] += votes[optionId];
        }

        _votesInRoundByUser[roundId][msg.sender] = sum;

        if (!_userVotedInRound[roundId][msg.sender] && sum != 0) {
            _userVotedInRound[roundId][msg.sender] = true;
            _userCountInRound[roundId]++;
        }
        if (_userVotedInRound[roundId][msg.sender] && sum == 0) {
            _userVotedInRound[roundId][msg.sender] = false;
            _userCountInRound[roundId]--;
        }

        emit CastVotesEvent(msg.sender, roundId);
    }

    // allow oracle to check votes
    function toggleVoteBalanceChecker(address checker) public isOwner {
        allowedCheckers[checker] = !allowedCheckers[checker];
    }

    // increase votes proportionally to the increase in balance
    function checkVoteBalance(uint roundId, address user, uint newBalance) internal {
        // return if newBalance is lower than the number of votes
        // return if user didn't vote
        if (newBalance > _votesInRoundByUser[roundId][user] || _votesInRoundByUser[roundId][user] == 0) {
            return;
        }
        uint[] storage oldVotes = _votesForOptionByUser[roundId][user];
        uint newSum;
        for (uint optionId = 0; optionId < oldVotes.length; optionId++) {
            uint oldVoteBalance = oldVotes[optionId];
            uint newVoteBalance = oldVoteBalance * newBalance / _votesInRoundByUser[roundId][user];
            _votesForOption[roundId][optionId] -= (oldVoteBalance - newVoteBalance);
            _votesForOptionByUser[roundId][user][optionId] = newVoteBalance;
            newSum += newVoteBalance;
        }
        _votesInRoundByUser[roundId][user] = newSum;
    }

    // increase votes proportionally to the increase in balance
    function checkVoteBalances(address user, uint newBalance) public {
        require(allowedCheckers[msg.sender],"sender is not allowed to check balances");
        for(uint i = 0; i < activeRounds.length; i++) {
            checkVoteBalance(activeRounds[i],user,newBalance);
        }
    }

    // remove roundId from activeRounds
    function finalizeRound(uint roundId) public isOwner {
        uint[] memory filteredRounds = new uint[](activeRounds.length-1);
        uint j = 0;
        for (uint i = 0; i < activeRounds.length; i++) {
            if (activeRounds[i] == roundId) {
                continue;
            }
            filteredRounds[j] = activeRounds[i];
            j++;
        }
        activeRounds = filteredRounds;
        pastRounds.push(roundId);
    }
}
