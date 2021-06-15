//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './interfaces/IVoter.sol';
import './interfaces/IERC20.sol';
import './interfaces/IBalanceKeeper.sol';

/// @title ClaimGTON
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract ClaimGTON {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IERC20 public governanceToken;
    IBalanceKeeper public balanceKeeper;
    IVoter[] public voteContracts;
    address public wallet;
    bool public canClaim = false;

    mapping (address => uint) public lastClaimTimestamp;
    mapping (address => uint) public limitMax;
    mapping (address => uint) public limitWithdrawn;
    bool public limitActivated = false;

    event Claim(address indexed sender, address indexed receiver, uint amount);
    event SetOwner(address ownerOld, address ownerNew);

    constructor(address _owner,
                IERC20 _governanceToken,
                address _wallet,
                IBalanceKeeper balance,
                IVoter[] memory votes) {
        owner = _owner;
        governanceToken = _governanceToken;
        wallet = _wallet;
        balanceKeeper = balance;
        voteContracts = votes;
    }

    function setOwner(address _owner) public isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    function setWallet(address _wallet) public isOwner {
        wallet = _wallet;
    }

    function setVoteContracts(IVoter[] calldata newVotes) public isOwner {
        voteContracts = newVotes;
    }

    function setGovernanceToken(IERC20 _governanceToken) public isOwner {
        governanceToken = _governanceToken;
    }

    function setBalanceContract(IBalanceKeeper newBalance) public isOwner {
        balanceKeeper = newBalance;
    }

    function setCanClaim(bool _canClaim) public isOwner {
        canClaim = _canClaim;
    }

    function setLimitActivated(bool _limitActivated) public isOwner {
        limitActivated = _limitActivated;
    }

    function claim(uint amount, address to) public {
        require(canClaim, "can't claim");
        uint balance = balanceKeeper.userBalance(msg.sender);
        require(balance >= amount, "not enough money");
        uint max;
        uint withdrawn;
        uint timestamp;
        if (limitActivated) {
            if ((block.timestamp - lastClaimTimestamp[msg.sender]) > 86400) {
                max = balance / 2;
                withdrawn = 0;
                timestamp = block.timestamp;
            } else {
                max = limitMax[msg.sender];
                withdrawn = limitWithdrawn[msg.sender];
                timestamp = lastClaimTimestamp[msg.sender];
            }
            require((amount + withdrawn) <= max, "exceeded daily limit");
        }
        balanceKeeper.subtractValue(msg.sender, amount);
        for (uint i = 0; i < voteContracts.length; i++) {
            voteContracts[i].checkVoteBalances(msg.sender);
        }
        if (limitActivated) {
            limitMax[msg.sender] = max - amount;
            limitWithdrawn[msg.sender] = withdrawn + amount;
            lastClaimTimestamp[msg.sender] = timestamp;
        }
        governanceToken.transferFrom(wallet, to, amount);
        emit Claim(msg.sender, to, amount);
    }
}
