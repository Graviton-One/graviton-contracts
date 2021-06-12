//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IERC20 {
    function mint(address _to, uint256 _value) external;
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
    function transfer(address _to, uint _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint _value) external returns (bool success);
    function balanceOf(address _owner) external view returns (uint balance);
}

/// @title ImpactKeeper
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
abstract contract ImpactKeeper {

    address public owner;
    address public nebula;

    // total locked usd amount
    uint public totalSupply;
    // stable coins that are allowed to be processed
    mapping(address => bool) public allowedTokens;

    mapping (address => uint) public impact;
    mapping (uint => address) public users;
    uint public userCount;

    // for processing mass transfers
    uint public finalValue;

    bool public claimIsAllowed = false;

    // processed data array
    mapping (uint => bool) public dataId;

    event Transfer(address token, address user, uint256 value, uint256 id, uint256 action);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner, address _nebula, address[] memory _allowedTokens) {
        owner = _owner;
        nebula = _nebula;
        for (uint i = 0; i < _allowedTokens.length; i++){
            allowedTokens[_allowedTokens[i]] = true;
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

    function setClaimIsAllowed(bool _claimIsAllowed) public isOwner {
        claimIsAllowed = _claimIsAllowed;
    }

    modifier isNebula() {
        require(msg.sender == nebula, "Caller is not nebula");
        _;
    }

    function setNebula(address _nebula) public isOwner {
        nebula = _nebula;
    }

    function allowToken(address token) public isOwner {
        allowedTokens[token] = true;
    }

    function forbidToken(address token) public isOwner {
        allowedTokens[token] = false;
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
