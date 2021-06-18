//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IVoter {
    function owner() external view returns (address);
    function balanceKeeper() external view returns (address);
    function totalRounds() external view returns (uint);
    function activeRounds
        (uint roundId)
        external view returns (uint);
    function pastRounds
        (uint roundId)
        external view returns (uint);
    function canCheck
        (address user)
        external view returns (bool);
    function roundName
        (uint roundId)
        external view returns (string memory);
    function roundOptions
        (uint roundId,
         uint optionId)
        external view returns (string memory);
    function votesForOption
        (uint roundId,
         uint optionId)
        external view returns (uint);
    function votesInRoundByUser
        (uint roundId,
         address user)
        external view returns (uint);
    function votesForOptionByUser
        (uint roundId,
         address user,
         uint optionId)
        external view returns (uint);
    function userVotedInRound
        (uint roundId,
         address user)
        external view returns (bool);
    function userVotedForOption
        (uint roundId,
         uint optionId,
         address user)
        external view returns (bool);
    function totalUsersInRound
        (uint roundId)
        external view returns (uint);
    function totalUsersForOption
        (uint roundId,
         uint optionId)
        external view returns (uint);
    function votesInRound
        (uint roundId)
        external view returns (uint);
    function totalActiveRounds() external view returns (uint);
    function totalPastRounds() external view returns (uint);
    function totalRoundOptions
        (uint roundId)
        external returns (uint);
    function setOwner
        (address _owner)
        external;
    function startRound
        (string memory name, string[] memory options)
        external;
    function isActiveRound
        (uint roundId)
        external view returns (bool);
    function isPastRound
        (uint roundId)
        external view returns (bool);
    function castVotes
        (uint roundId, uint[] memory votes)
        external;
    function setCanCheck
        (address checker, bool _canCheck)
        external;
    function checkVoteBalances
        (address user)
        external;
    function finalizeRound
        (uint roundId)
        external;
}
