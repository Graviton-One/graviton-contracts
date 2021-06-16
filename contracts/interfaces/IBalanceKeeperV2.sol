//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceKeeperV2 {
    function userChainById
        (uint userId)
        external view returns (string memory);
    function userAddressById
        (uint userId)
        external view returns (bytes calldata);
    function userChainAddressById
        (uint userId)
        external view returns (string calldata, bytes calldata);
    function userIdByChainAddress
        (string calldata userChain,
         bytes calldata userAddress)
        external view returns (uint);
    function isKnownUser
        (string calldata userChain,
         bytes calldata userAddress)
        external view returns (bool);
    function isKnownUser
        (uint userId)
        external view returns (bool);
    function totalUsers() external view returns (uint);
    function balance
        (uint userId)
        external view returns (uint);
    function balance
        (string calldata userChain,
         bytes calldata userAddress)
        external view returns (uint);
    function totalBalance() external view returns (uint);
    function open
        (string calldata userChain,
         bytes calldata userAddress)
        external;
    function add
        (uint userId,
         uint amount)
        external;
    function add
        (string calldata userChain,
         bytes calldata userAddress,
         uint amount)
        external;
    function subtract
        (uint userId,
         uint amount)
        external;
    function subtract
        (string calldata userChain,
         bytes calldata userAddress,
         uint amount)
        external;
}
