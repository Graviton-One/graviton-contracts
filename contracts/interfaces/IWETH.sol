pragma solidity >=0.8.0;

interface IWETH {
    function deposit() external payable;

    function withdraw(uint amount) external;

    function transfer(address to, uint amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}
