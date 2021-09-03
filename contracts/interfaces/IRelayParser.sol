//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IRelay.sol";

/// @title The interface for Graviton oracle parser
/// @notice Parses oracle data about crosschain locking/unlocking events
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
interface IRelayParser {
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
    function router() external view returns (IRelay);

    /// @notice Sets address of the oracle router to `_router`
    function setRouter(IRelay _router) external;

    /// @notice topic0 of the event associated with initiating a relay transfer
    // function relayTopic() external view returns (bytes32);

    /// @notice Sets topic0 of the event associated with initiating a relay transfer
    // function setRelayTopic(bytes32 _relayTopic) external;

    /// @notice TODO
    function isEVM(string calldata chain) external view returns (bool);

    /// @notice TODO
    /// @param chain TODO
    /// @param newBool TODO
    function setIsEVM(string calldata chain, bool newBool) external;

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
    event SetOwner(address indexed ownerOld, address indexed ownerNew);

    /// @notice Event emitted when the nebula changes via `#setNebula`.
    /// @param nebulaOld The account that was the previous nebula
    /// @param nebulaNew The account that became the nebula
    event SetNebula(address indexed nebulaOld, address indexed nebulaNew);

    /// @notice Event emitted when the router changes via `#setRouter`.
    /// @param routerOld The previous router
    /// @param routerNew The new router
    event SetRouter(IRelay indexed routerOld, IRelay indexed routerNew);

    /// @notice TODO
    /// @param chain TODO
    /// @param newBool TODO
    event SetIsEVM(string chain, bool newBool);

    /// @notice Event emitted when the data is parsed and forwarded to the oracle router via `#attachValue`
    event AttachValue(bytes data);
}
