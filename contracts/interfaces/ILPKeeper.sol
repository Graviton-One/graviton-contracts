//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface ILPKeeper {
    function add(
        address lptoken,
        address user,
        uint256 amount
    ) external;

    function subtract(
        address lptoken,
        address user,
        uint256 amount
    ) external;

    function userBalance(address lptoken, address user)
        external
        returns (uint256);

    function totalBalance(address lptoken) external returns (uint256);

    function totalUsers(address lptoken) external returns (uint256);

    function users(address lptoken, uint256 userId) external returns (address);

    function totalLPTokens() external returns (uint256);

    function lpTokens(uint256 tokenId) external returns (address);
}
