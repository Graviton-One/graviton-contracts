//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IERC20.sol";
import "./staker.sol";

contract LpFarming {
    address public owner;
    Staker public staker;
    address public gton;

    constructor(
        address _owner,
        Staker _staker,
        address _gton
    ) {
        gton = _gton;
        owner = _owner;
        staker = _staker;
    }

    // owner control functions
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function transferOwnership(address _owner) public isOwner {
        owner = _owner;
    }
    
    function deposit(uint _farmId, uint _amount) public {
        (IERC20 providingToken,,,,,) = staker.farmInfo(_farmId);
        require(providingToken.transferFrom(msg.sender,address(this),_amount),'lol');
        staker.depositFor(_farmId,_amount,msg.sender);
    }
    
    function withdraw(uint _farmId, uint _amount) public {
        (IERC20 providingToken,,,,,) = staker.farmInfo(_farmId);
        staker.withdrawFor(_farmId,_amount,msg.sender);
        require(providingToken.transfer(msg.sender,_amount),'lol');
    }
    
    function claim(uint _farmId) public {
        staker.claimFor(_farmId,msg.sender);
    }
}
