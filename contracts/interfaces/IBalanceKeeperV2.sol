//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IShares.sol";

interface IBalanceKeeperV2 is IShares {
    function owner() external view returns (address);

    function canAdd(address user) external view returns (bool);

    function canSubtract(address user) external view returns (bool);

    function canOpen(address user) external view returns (bool);

    function totalUsers() external view returns (uint256);

    function totalBalance() external view returns (uint256);

    function setOwner(address _owner) external;

    function setCanOpen(address opener, bool _canOpen) external;

    function setCanAdd(address adder, bool _canAdd) external;

    function setCanSubtract(address subtractor, bool _canSubtract) external;

    function isKnownUser(string calldata userChain, bytes calldata userAddress)
        external
        view
        returns (bool);

    function isKnownUser(uint256 userId) external view returns (bool);

    function userChainById(uint256 userId)
        external
        view
        returns (string memory);

    function userAddressById(uint256 userId)
        external
        view
        returns (bytes calldata);

    function userChainAddressById(uint256 userId)
        external
        view
        returns (string calldata, bytes calldata);

    function userIdByChainAddress(
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (uint256);

    function balance(uint256 userId) external view returns (uint256);

    function balance(string calldata userChain, bytes calldata userAddress)
        external
        view
        returns (uint256);

    function open(string calldata userChain, bytes calldata userAddress)
        external;

    function add(uint256 userId, uint256 amount) external;

    function add(
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    function subtract(uint256 userId, uint256 amount) external;

    function subtract(
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;
}
