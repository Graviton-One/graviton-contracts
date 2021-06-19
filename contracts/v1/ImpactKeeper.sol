//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IERC20.sol";
import "../interfaces/IImpactKeeper.sol";

/// @title ImpactKeeper
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
abstract contract ImpactKeeper is IImpactKeeper {
    event Transfer(
        address token,
        address user,
        uint256 value,
        uint256 id,
        uint256 action
    );

    // priveleged addresses
    address public owner;
    address public nebula;

    // total locked usd amount
    uint256 public override totalSupply;
    // tokens that are allowed to be processed
    mapping(address => bool) public allowedTokens;

    // users impact and amounts
    mapping(address => uint256) public override impact;
    mapping(address => uint256) public pendingAmounts;
    // for token airdrop
    mapping(uint256 => address) public override users;
    uint256 public override userCount;
    // balance pools
    uint256 public currentBP;
    uint256 public lastBP;
    uint256 public lastEmissionProcessed;

    // for processing mass transfers
    uint256 public final_value;

    // for migration
    uint256 private last;
    bool private notDeprecated = true;

    bool public claimAllowance;

    // processed data array
    mapping(uint256 => bool) public dataId;

    constructor(
        address _owner,
        address _nebula,
        address[] memory _allowedTokens
    ) {
        for (uint256 i = 0; i < _allowedTokens.length; i++) {
            allowedTokens[_allowedTokens[i]] = true;
        }
        owner = _owner;
        nebula = _nebula;
        claimAllowance = false;
    }

    // farm transfer
    function setClaimingAllowance(bool _claimAllowance) public isOwner {
        claimAllowance = _claimAllowance;
    }

    // owner control functions
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function transferOwnership(address newOwnerAddress) public isOwner {
        owner = newOwnerAddress;
    }

    // nebula control functions
    modifier isNebula() {
        require(msg.sender == nebula, "Caller is not nebula");
        _;
    }

    function transferNebula(address newNebulaAddress) public isOwner {
        nebula = newNebulaAddress;
    }

    // nebula methods
    function addNewToken(address newTokenAddress) public isOwner {
        allowedTokens[newTokenAddress] = true;
    }

    function removeToken(address newTokenAddress) public isOwner {
        allowedTokens[newTokenAddress] = false;
    }

    function getPendingAmount(address usr) public view returns (uint256) {
        return pendingAmounts[usr];
    }

    function deserializeUint(
        bytes memory b,
        uint256 startPos,
        uint256 len
    ) external pure returns (uint256) {
        uint256 v = 0;
        for (uint256 p = startPos; p < startPos + len; p++) {
            v = v * 256 + uint256(uint8(b[p]));
        }
        return v;
    }

    function deserializeAddress(bytes memory b, uint256 startPos)
        external
        view
        returns (address)
    {
        return address(uint160(this.deserializeUint(b, startPos, 20)));
    }

    // called from gravity to add impact to users
    function attachValue(bytes calldata impactData) external virtual;
}
