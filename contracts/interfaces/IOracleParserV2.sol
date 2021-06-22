//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IOracleRouterV2.sol";

/// @title The interface for Graviton oracle parser
/// @notice Parses oracle data about crosschain locking/unlocking events
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IOracleParserV2 {
    /// @notice User that can grant access permissions and perform privileged actions
    function owner() external view returns (address);

    /// @notice Transfers ownership of the contract to a new account (`_owner`).
    /// @dev Can only be called by the current owner.
    function setOwner(address _owner) external;

    /// @notice User that can send oracle data
    function nebula() external view returns (address);

    /// @notice Sets address of the user that can send oracle data to `_nebula`
    /// @dev Can only be called by the current owner.
    function setNebula(address _nebula) external;

    /// @notice Address of the contract that routes parsed data to balance keepers
    function oracleRouter() external view returns (IOracleRouterV2);

    /// @notice Sets address of the oracle router to `_oracleRouter`
    function setOracleRouter(IOracleRouterV2 _oracleRouter) external;

    /// @notice Index from the array of chains parsed as "EVM"
    function evmChains(uint index) external view returns (string memory);

    /// @notice Sets the array of chains parsed as "EVM"
    /// @param _evmChains Array of blockchain names, i.e. ["ETH","BNB","FTM"]
    function setEVMChains(string[] memory _evmChains) external;

    /// @notice Look up if the data uuid has already been processed
    function uuidIsProcessed(bytes16 uuid) external view returns (bool);

    /// @notice Parses a uint value from bytes
    function deserializeUint(
        bytes memory b,
        uint256 startPos,
        uint256 len
    ) external pure returns (uint256);

    /// @notice Parses an evm address from bytes
    function deserializeAddress(bytes memory b, uint256 startPos)
        external
        pure
        returns (address);

    /// @notice Parses bytes32 from bytes
    function bytesToBytes32(bytes memory b, uint256 offset)
        external
        pure
        returns (bytes32);

    /// @notice Parses bytes16 from bytes
    function bytesToBytes16(bytes memory b, uint256 offset)
        external
        pure
        returns (bytes16);

    /// @notice Compares two strings for equality
    /// @return true if strings are equal, false otherwise
    function equal(string memory a, string memory b)
        external
        pure
        returns (bool);

    /// @notice Parses data from oracles, forwards data to the oracle router
    function attachValue(bytes calldata impactData) external;

    /// @notice Event emitted when the owner changes via `#setOwner`.
    /// @param ownerOld The account that was the previous owner of the contract
    /// @param ownerNew The account that became the owner of the contract
    event SetOwner(address ownerOld, address ownerNew);

    /// @notice Event emitted when the nebula changes via `#setNebula`.
    /// @param nebulaOld The account that was the previous nebula
    /// @param nebulaNew The account that became the nebula
    event SetNebula(address nebulaOld, address nebulaNew);

    /// @notice Event emitted when the router changes via `#setOracleRouter`.
    /// @param routerOld The previous router
    /// @param routerNew The new router
    event SetOracleRouter(IOracleRouterV2 routerOld, IOracleRouterV2 routerNew);

    /// @notice Event emitted when the evm chains are set via `#setEVMChains`
    /// @param _evmChains Array of blockchain names, i.e. ["ETH","BNB","FTM"]
    event SetEVMChains(string[] _evmChains);

    /// @notice Event emitted when the data is parsed and forwarded to the oracle router via `#attachValue`
    /// @param nebula The account that sent the parsed data
    /// @param uuid Unique identifier of the parsed data
    /// @dev UUID is extracted by the oracles to confirm the delivery of data
    /// @param chain Type of blockchain associated with the parsed event, i.e. "EVM"
    /// @param emiter The blockchain-specific address where the parsed event originated
    /// @param topic0 The topic0 of the parsed event
    /// @param token The blockchain-specific token address
    /// @param sender The blockchain-specific address that sent the tokens
    /// @param receiver The blockchain-specific address to receive the tokens
    /// @param amount The amount of tokens
    event AttachValue(
        address nebula,
        bytes16 uuid,
        string chain,
        bytes emiter,
        bytes32 topic0,
        bytes token,
        bytes sender,
        bytes receiver,
        uint256 amount
    );
}
