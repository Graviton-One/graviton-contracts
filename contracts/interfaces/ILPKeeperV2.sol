//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IBalanceKeeperV2.sol";

interface ILPKeeperV2 {
    function owner() external view returns (address);

    function canAdd(address user) external view returns (bool);

    function canSubtract(address user) external view returns (bool);

    function canOpen(address user) external view returns (bool);

    function balanceKeeper() external view returns (IBalanceKeeperV2);

    function setOwner(address _owner) external;

    function setCanOpen(address openeer, bool _canOpen) external;

    function setCanAdd(address adder, bool _canAdd) external;

    function setCanSubtract(address subtractor, bool _canSubtract) external;

    function tokenChainById(uint256 id) external view returns (string calldata);

    function tokenAddressById(uint256 id)
        external
        view
        returns (bytes calldata);

    function tokenChainAddressById(uint256 id)
        external
        view
        returns (string calldata, bytes calldata);

    function tokenIdByChainAddress(
        string calldata chain,
        bytes calldata userAddress
    ) external view returns (uint256);

    function isKnownToken(uint256 tokenId) external view returns (bool);

    function isKnownToken(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (bool);

    function totalTokens() external view returns (uint256);

    function tokenUser(uint256 tokenId, uint256 userIndex)
        external
        view
        returns (uint256);

    function tokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userIndex
    ) external view returns (uint256);

    function isKnownTokenUser(uint256 tokenId, uint256 userId)
        external
        view
        returns (bool);

    function isKnownTokenUser(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (bool);

    function isKnownTokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId
    ) external view returns (bool);

    function isKnownTokenUser(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (bool);

    function totalTokenUsers(uint256 tokenId) external view returns (uint256);

    function totalTokenUsers(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (uint256);

    function balance(uint256 tokenId, uint256 userId)
        external
        view
        returns (uint256);

    function balance(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (uint256);

    function balance(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId
    ) external view returns (uint256);

    function balance(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress
    ) external view returns (uint256);

    function totalBalance(uint256 tokenId) external view returns (uint256);

    function totalBalance(
        string calldata tokenChain,
        bytes calldata tokenAddress
    ) external view returns (uint256);

    function open(string calldata tokenChain, bytes calldata tokenAddress)
        external;

    function add(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) external;

    function add(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    function add(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId,
        uint256 amount
    ) external;

    function add(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    function subtract(
        uint256 tokenId,
        uint256 userId,
        uint256 amount
    ) external;

    function subtract(
        uint256 tokenId,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;

    function subtract(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        uint256 userId,
        uint256 amount
    ) external;

    function subtract(
        string calldata tokenChain,
        bytes calldata tokenAddress,
        string calldata userChain,
        bytes calldata userAddress,
        uint256 amount
    ) external;
}
