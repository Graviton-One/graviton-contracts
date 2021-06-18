//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IOracleRouterV2.sol";

interface IOracleParserV2 {
    function owner() external view returns (address);

    function nebula() external view returns (address);

    function oracleRouter() external view returns (IOracleRouterV2);

    function uuidIsProcessed(bytes16 uuid) external view returns (bool);

    function setOwner(address _owner) external;

    function setNebula(address _nebula) external;

    function setOracleRouter(IOracleRouterV2 _oracleRouter) external;

    function deserializeUint(
        bytes memory b,
        uint256 startPos,
        uint256 len
    ) external pure returns (uint256);

    function deserializeAddress(bytes memory b, uint256 startPos)
        external
        pure
        returns (address);

    function bytesToBytes32(bytes memory b, uint256 offset)
        external
        pure
        returns (bytes32);

    function bytesToBytes16(bytes memory b, uint256 offset)
        external
        pure
        returns (bytes16);

    function equal(string memory a, string memory b)
        external
        pure
        returns (bool);

    function attachValue(bytes calldata impactData) external;
}
