//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IImpactKeeper.sol';

/// @title ImpactKeeper
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
abstract contract ImpactKeeper is IImpactKeeper {

    address public owner;
    address public nebula;

    // total locked usd amount
    uint public override totalSupply;
    // stable coins that are allowed to be processed
    mapping(address => bool) public tokenIsAllowed;

    mapping (address => uint) public override impact;
    mapping (uint => address) public override users;
    uint public override totalUsers;

    // processed data array
    mapping (uint => bool) public dataId;

    event Transfer(address token, address user, uint256 value, uint256 id, uint256 action);
    event SetOwner(address ownerOld, address ownerNew);
    event SetNebula(address nebulaOld, address nebulaNew);

    constructor(address _owner, address _nebula, address[] memory allowedTokens) {
        owner = _owner;
        nebula = _nebula;
        for (uint i = 0; i < allowedTokens.length; i++){
            tokenIsAllowed[allowedTokens[i]] = true;
        }
    }

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    modifier isNebula() {
        require(msg.sender == nebula, "Caller is not nebula");
        _;
    }

    function setNebula(address _nebula) public isOwner {
        address nebulaOld = nebula;
        nebula = _nebula;
        emit SetNebula(nebulaOld, _nebula);
    }

    function allowToken(address token) public isOwner {
        tokenIsAllowed[token] = true;
    }

    function forbidToken(address token) public isOwner {
        tokenIsAllowed[token] = false;
    }

    function deserializeUint(bytes memory b, uint startPos, uint len) external pure returns (uint) {
        uint v = 0;
        for (uint p = startPos; p < startPos + len; p++) {
            v = v * 256 + uint(uint8(b[p]));
        }
        return v;
    }

    function deserializeAddress(bytes memory b, uint startPos) external view returns (address) {
        return address(uint160(this.deserializeUint(b, startPos, 20)));
    }

    // called from gravity to add impact to users
    function attachValue(bytes calldata impactData) external virtual;
}
