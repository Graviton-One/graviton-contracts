//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IERC20.sol';
import './interfaces/IBalanceKeeperV2.sol';
import './interfaces/IVoter.sol';

/// @title ClaimGTONV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract ClaimGTONV2 {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IERC20 public governanceToken;
    IBalanceKeeperV2 public balanceKeeper;
    IVoter public voter;
    address public wallet;

    bool public claimActivated = false;
    bool public limitActivated = false;

    event Claim(address indexed sender, address indexed receiver, uint amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner,
                IERC20 _governanceToken,
                address _wallet,
                IBalanceKeeperV2 _balanceKeeper,
                IVoter _voter) {
        owner = _owner;
        governanceToken = _governanceToken;
        wallet = _wallet;
        balanceKeeper = _balanceKeeper;
        voter = _voter;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setWallet(address _wallet) public isOwner {
        wallet = _wallet;
    }

    function setVoter(IVoter _voter) public isOwner {
        voter = _voter;
    }

    function setGovernanceToken(IERC20 _governanceToken) public isOwner {
        governanceToken = _governanceToken;
    }

    function setBalanceKeeper(IBalanceKeeperV2 _balanceKeeper) public isOwner {
        balanceKeeper = _balanceKeeper;
    }

    function setClaimActivated(bool _claimActivated) public isOwner {
        claimActivated = _claimActivated;
    }

    function setLimitActivated(bool _limitActivated) public isOwner {
        limitActivated = _limitActivated;
    }

    /// @dev Returns the block timestamp. This method is overridden in tests.
    function _blockTimestamp() internal view virtual returns (uint) {
        return block.timestamp;
    }

    mapping (address => uint) public lastLimitTimestamp;
    mapping (address => uint) public limitMax;

    function claim(uint amount, address to) public {
        require(claimActivated, "can't claim");
        uint balance = balanceKeeper.balance("EVM", abi.encodePacked(msg.sender));
        require(balance >= amount, "not enough money");
        if (limitActivated) {
          if ((_blockTimestamp() - lastLimitTimestamp[msg.sender]) > 86400) {
            lastLimitTimestamp[msg.sender] = _blockTimestamp();
            limitMax[msg.sender] = balance / 2;
          }
          require(amount <= limitMax[msg.sender], "exceeded daily limit");
          limitMax[msg.sender] -= amount;
        }
        balanceKeeper.subtract("EVM", abi.encodePacked(msg.sender), amount);
        voter.checkVoteBalances(msg.sender);
        governanceToken.transferFrom(wallet, to, amount);
        emit Claim(msg.sender, to, amount);
    }
}