//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ICan.sol";
import "./CanToken.sol";

contract CandyShop {
    
    address owner;
    bool revertFlag;
    
    mapping(bytes => address) public canContracts;
    mapping(uint => address) public allCans;
    uint public canLength;

    constructor(
        address _owner
    ) {
        owner = _owner;
        revertFlag = false;
    }
    
    modifier onlyOwner() {
        require(msg.sender==owner,'not owner');
        _;
    }
    
    modifier notReverted() {
        require(!revertFlag,'Option is closed to use');
        _;
    }
    
    function toggleRevert() public onlyOwner {
        revertFlag = !revertFlag;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
    
    function emergencyTakeout(IERC20 _token, address _to, uint _amount) public onlyOwner {
        require(_token.transfer(_to,_amount),"error");
    }

    function createCan(
        uint _farmId,
        address _farm,
        address _router,
        address _lpToken,
        address _providingToken,
        address _rewardToken,
        uint _fee
    ) public notReverted {
        bytes memory key = abi.encodePacked(_farmId,_farm,_lpToken,_providingToken,_rewardToken);
        require(canContracts[key]==address(0),"can exist");
        Can canAddr = new Can(
            owner,
            owner,
            _farmId,
            _farm,
            _router,
            _lpToken,
            _providingToken,
            _rewardToken,
             _fee
        );
        canContracts[key] = address(canAddr);
        allCans[canLength] = address(canAddr);
        canLength++;
    }
}

