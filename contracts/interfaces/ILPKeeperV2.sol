//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface ILPKeeperV2 {
    function tokenChainById
        (uint id)
        external view returns (string calldata);
    function tokenAddressById
        (uint id)
        external view returns (bytes calldata);
    function tokenChainAddressById
        (uint id)
        external view returns (string calldata, bytes calldata);
    function tokenIdByChainAddress
        (string calldata chain,
         bytes calldata userAddress)
        external view returns (uint);
    function isKnownToken
        (uint tokenId)
        external view returns (bool);
    function isKnownToken
        (string calldata tokenChain,
         bytes calldata tokenAddress)
        external view returns (bool);
    function totalTokens() external view returns (uint);
    function tokenUser
        (uint tokenId,
         uint userIndex)
        external view returns (uint);
    function tokenUser
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         uint userIndex)
        external view returns (uint);
    function isKnownTokenUser
        (uint tokenId,
         uint userId)
        external view returns (bool);
    function isKnownTokenUser
        (uint tokenId,
         string calldata userChain,
         bytes calldata userAddress)
        external view returns (bool);
    function isKnownTokenUser
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         uint userId)
        external view returns (bool);
    function isKnownTokenUser
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         string calldata userChain,
         bytes calldata userAddress)
        external view returns (bool);
    function totalTokenUsers
        (uint tokenId)
        external view returns (uint);
    function totalTokenUsers
        (string calldata tokenChain,
         bytes calldata tokenAddress)
        external view returns (uint);
    function balance
        (uint tokenId,
         uint userId)
        external view returns (uint);
    function balance
        (uint tokenId,
         string calldata userChain,
         bytes calldata userAddress)
        external view returns (uint);
    function balance
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         uint userId)
        external view returns (uint);
    function balance
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         string calldata userChain,
         bytes calldata userAddress)
        external view returns (uint);
    function totalBalance
        (uint tokenId)
        external view returns (uint);
    function totalBalance
        (string calldata tokenChain,
         bytes calldata tokenAddress)
        external view returns (uint);
    function open
        (string calldata tokenChain,
         bytes calldata tokenAddress)
        external;
    function add
        (uint tokenId,
         uint userId,
         uint amount) external;
    function add
        (uint tokenId,
         string calldata userChain,
         bytes calldata userAddress,
         uint amount) external;
    function add
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         uint userId,
         uint amount) external;
    function add
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         string calldata userChain,
         bytes calldata userAddress,
         uint amount) external;
    function subtract
        (uint tokenId,
         uint userId,
         uint amount) external;
    function subtract
        (uint tokenId,
         string calldata userChain,
         bytes calldata userAddress,
         uint amount) external;
    function subtract
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         uint userId,
         uint amount) external;
    function subtract
        (string calldata tokenChain,
         bytes calldata tokenAddress,
         string calldata userChain,
         bytes calldata userAddress,
         uint amount) external;
}
