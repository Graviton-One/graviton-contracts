//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IConvertor.sol";
import "./interfaces/IERC20.sol";


contract Convertor is IConvertor {    
    address public owner;
    uint256 public price;

    bool public swapActivated;
    bool public limitActivated;

    address public wallet;
    IERC20 public gton;

    modifier isOwner() {
        require(msg.sender == owner, "Only owner allowed.");
        _;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setWallet(address _wallet) public isOwner {
        address walletOld = wallet;
        wallet = _wallet;
        emit SetWallet(walletOld, _wallet);
    }

    function setPrice(uint _price) public isOwner {
        uint priceOld = price;
        price = _price;
        emit SetPrice(priceOld, _price);
    }

    function calcAmountOut(uint amount) internal pure returns (uint) {

    }

    function convert(uint amount) public override {
        require(gton.transferFrom(msg.sender, address(this), amount), "Not enought of allowed gton.");
        // uint amountOut = calcAmountOut(amount);
        // gton.transferFrom(wallet, msg.sender, amountOut);
        // emit Swap(msg.sender, msg.sender, amount, amountOut);
    }
}