//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IWormhole.sol";
import "./interfaces/ERC20.sol";


contract Wormhole is IWormhole {    
    address public owner;
    address public price;

    bool public override swapActivated;
    bool public override limitActivated;

    ERC20 public wallet;
    ERC20 public gton;

    modifier isOwner() {
        require(msg.sender == owner, "Only owner allowed.");
        _;
    }

    function setOwner(address _owner) public override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setWallet(address _wallet) public override isOwner {
        address walletOld = wallet;
        wallet = _wallet;
        emit SetWallet(walletOld, _wallet);
    }

    function setPrice(uint _price) public onlyOwner {
        uint priceOld = price;
        price = _price;
        emit SetPrice(priceOld, _price);
    }

    function calcAmountOut(uint amount) internal returns (uint) {

    }

    function swap(uint amount) public returns (uint) {
        require(gton.transferFrom(msg.sender, address(this), amount), "Not enought of allowed gton.");
        uint amountOut = calcAmountOut(amount);
        gton.transferFrom(wallet, msg.sender, amountOut);
        emit Swap(msg.sender, msg.sender, amount, amountOut);
    }
}