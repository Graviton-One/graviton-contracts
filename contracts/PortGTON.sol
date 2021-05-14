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

interface IBalanceKeeper {
    function addValue(address user, uint value) external;
    function userBalance(address user) external returns (uint);
    function subtractValue(address user, uint value) external;
}

interface IVoter {
    function checkVoteBalances(address user, uint newBalance) external;
}

/// @title PortGTON
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract PortGTON {

    address public owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    IERC20 public gtonToken;
    IBalanceKeeper public balanceContract;
    IVoter[] public voteContracts;
    bool public canUnlock = false;
    bool public canLock = false;

    constructor(address _owner, IERC20 gton, IBalanceKeeper balance, IVoter[] memory votes) {
        owner = _owner;
        gtonToken = gton;
        balanceContract = balance;
        voteContracts = votes;
    }

    function setVoteContracts(IVoter[] calldata newVotes) public isOwner {
        voteContracts = newVotes;
    }

    function setGtonToken(IERC20 newGton) public isOwner {
        gtonToken = newGton;
    }

    function setBalanceContract(IBalanceKeeper newBalance) public isOwner {
        balanceContract = newBalance;
    }

    function toggleLock() public isOwner {
        canLock = !canLock;
    }

    function toggleUnlock() public isOwner {
        canUnlock = !canUnlock;
    }

    function migrateGton(address to, uint amount) public isOwner {
        require(gtonToken.transfer(to, amount), "can't transfer");
    }

    function lockTokens(uint amount) public {
        require(canLock, "can't lock");
        require(gtonToken.transferFrom(msg.sender, address(this), amount), "can't transfer");
        balanceContract.addValue(msg.sender, amount);
    }

    function unlockTokens(uint amount, address to) public {
        require(canUnlock, "can't unlock");
        uint balance = balanceContract.userBalance(msg.sender);
        require(balance >= amount, "not enough money");
        // transfer, fail if there's not enough gton on port, then update
        require(gtonToken.transfer(to, amount), "can't transfer tokens, probably not enough balance on port");
        balanceContract.subtractValue(msg.sender, amount);
        for (uint i = 0; i < voteContracts.length; i++) {
            voteContracts[i].checkVoteBalances(msg.sender, balanceContract.userBalance(msg.sender));
        }
    }
}
