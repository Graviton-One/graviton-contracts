//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBalanceKeeperV1 {
    function owner() external view returns (address);

    function allowedAdders(address user) external view returns (bool);

    function allowedSubtractors(address user) external view returns (bool);

    function totalUsers() external view returns (uint256);

    function knownUsers(address user) external view returns (bool);

    function userAddresses(uint256 index) external view returns (address);

    function userBalance(address user) external view returns (uint256);

    function totalBalance() external view returns (uint256);

    function transferOwnership(address newOwner) external;

    function toggleAdder(address adder) external;

    function toggleSubtractor(address subtractor) external;

    function addValue(address user, uint256 value) external;

    function subtractValue(address user, uint256 value) external;

    event AddValueEvent(
        address indexed adder,
        address indexed user,
        uint256 indexed amount
    );
    event SubtractValueEvent(
        address indexed subtractor,
        address indexed user,
        uint256 indexed amount
    );
    event TransferOwnershipEvent(address oldOwner, address newOwner);
    event ToggleAdderEvent(
        address indexed owner,
        address indexed adder,
        bool indexed newBool
    );
    event ToggleSubtractorEvent(
        address indexed owner,
        address indexed subtractor,
        bool indexed newBool
    );
}
