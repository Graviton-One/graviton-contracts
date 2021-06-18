//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IVoter {
    function owner() external view returns (address);

    function balanceKeeper() external view returns (address);

    function totalRounds() external view returns (uint256);

    function activeRounds(uint256 roundId) external view returns (uint256);

    function pastRounds(uint256 roundId) external view returns (uint256);

    function canCheck(address user) external view returns (bool);

    function roundName(uint256 roundId) external view returns (string memory);

    function roundOptions(uint256 roundId, uint256 optionId)
        external
        view
        returns (string memory);

    function votesForOption(uint256 roundId, uint256 optionId)
        external
        view
        returns (uint256);

    function votesInRoundByUser(uint256 roundId, address user)
        external
        view
        returns (uint256);

    function votesForOptionByUser(
        uint256 roundId,
        address user,
        uint256 optionId
    ) external view returns (uint256);

    function userVotedInRound(uint256 roundId, address user)
        external
        view
        returns (bool);

    function userVotedForOption(
        uint256 roundId,
        uint256 optionId,
        address user
    ) external view returns (bool);

    function totalUsersInRound(uint256 roundId) external view returns (uint256);

    function totalUsersForOption(uint256 roundId, uint256 optionId)
        external
        view
        returns (uint256);

    function votesInRound(uint256 roundId) external view returns (uint256);

    function totalActiveRounds() external view returns (uint256);

    function totalPastRounds() external view returns (uint256);

    function totalRoundOptions(uint256 roundId) external returns (uint256);

    function setOwner(address _owner) external;

    function startRound(string memory name, string[] memory options) external;

    function isActiveRound(uint256 roundId) external view returns (bool);

    function isPastRound(uint256 roundId) external view returns (bool);

    function castVotes(uint256 roundId, uint256[] memory votes) external;

    function setCanCheck(address checker, bool _canCheck) external;

    function checkVoteBalances(address user) external;

    function finalizeRound(uint256 roundId) external;
}
