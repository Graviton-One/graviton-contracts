//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IERC20 {
    function mint(address _to, uint256 _value) external;

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function increaseAllowance(address spender, uint256 addedValue)
        external
        returns (bool);

    function transfer(address _to, uint256 _value)
        external
        returns (bool success);

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool success);

    function balanceOf(address _owner) external view returns (uint256 balance);
    function totalSupply() external view returns (uint256 supply);
}

contract Wormhole {    
    address public owner;
    uint public num_up;
    uint public num_down;

    bool public isRevert;

    address public wallet;
    IERC20 public relict;
    IERC20 public gton;
    
    event Convert(address indexed user, uint amountIn, uint amountOut);
    
    constructor (
        address _owner,
        uint _num_up,
        uint _num_down,
        address _wallet,
        IERC20 _relict,
        IERC20 _gton
    ) {
        owner = _owner;
        num_up = _num_up;
        num_down = _num_down;
        wallet = _wallet;
        relict = _relict;
        gton = _gton;
    }
    
    modifier notReverted() {
        require(isRevert, "Only owner allowed.");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner allowed.");
        _;
    }

    function toggleRever() public  onlyOwner {
        isRevert = !isRevert;
    }

    function setOwner(address _owner) public  onlyOwner {
        owner = _owner;
    }

    function setWallet(address _wallet) public  onlyOwner {
        wallet = _wallet;
    }

    function setPrice(uint _num_up, uint _num_down) public onlyOwner {
        num_up = _num_up;
        num_down = _num_down;
    }

    function calcAmountOut(uint amountIn) public view returns (uint amountOut) {
        return amountIn * num_up / num_down;
    }
    
    function getValues() public view returns (uint num1, uint num2) {
        return (num_up, num_down);
    }

    function convert(uint amount) public notReverted {
        require(relict.transferFrom(msg.sender, address(this), amount), "Not enought of allowed gton.");
        uint amountOut = calcAmountOut(amount);
        gton.transferFrom(wallet, msg.sender, amountOut);
        emit Convert(msg.sender, amount, amountOut);
    }
}