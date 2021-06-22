//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IClaimGTONV2.sol";

/// @title ClaimGTONV2
/// @author Artemij Artamonov - <array.clean@gmail.com>
/// @author Anton Davydov - <fetsorn@gmail.com>
contract ClaimGTONV2 is IClaimGTONV2 {

    /// @inheritdoc IClaimGTONV2
    address public override owner;

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    /// @inheritdoc IClaimGTONV2
    IERC20 public override governanceToken;
    /// @inheritdoc IClaimGTONV2
    IBalanceKeeperV2 public override balanceKeeper;
    /// @inheritdoc IClaimGTONV2
    IVoterV2 public override voter;
    /// @inheritdoc IClaimGTONV2
    address public override wallet;

    /// @inheritdoc IClaimGTONV2
    bool public override claimActivated;
    /// @inheritdoc IClaimGTONV2
    bool public override limitActivated;

    /// @inheritdoc IClaimGTONV2
    mapping(address => uint256) public override lastLimitTimestamp;
    /// @inheritdoc IClaimGTONV2
    mapping(address => uint256) public override limitMax;

    constructor(
        IERC20 _governanceToken,
        address _wallet,
        IBalanceKeeperV2 _balanceKeeper,
        IVoterV2 _voter
    ) {
        owner = msg.sender;
        governanceToken = _governanceToken;
        wallet = _wallet;
        balanceKeeper = _balanceKeeper;
        voter = _voter;
    }

    /// @inheritdoc IClaimGTONV2
    function setOwner(address _owner) public override isOwner {
        address ownerOld = owner;
        owner = _owner;
        emit SetOwner(ownerOld, _owner);
    }

    /// @inheritdoc IClaimGTONV2
    function setWallet(address _wallet) public override isOwner {
        address walletOld = wallet;
        wallet = _wallet;
        emit SetWallet(walletOld, _wallet);
    }

    /// @inheritdoc IClaimGTONV2
    function setVoter(IVoterV2 _voter) public override isOwner {
        IVoterV2 voterOld = voter;
        voter = _voter;
        emit SetVoter(voterOld, _voter);
    }

    /// @inheritdoc IClaimGTONV2
    function setClaimActivated(bool _claimActivated) public override isOwner {
        claimActivated = _claimActivated;
    }

    /// @inheritdoc IClaimGTONV2
    function setLimitActivated(bool _limitActivated) public override isOwner {
        limitActivated = _limitActivated;
    }

    /// @dev Returns the block timestamp. This method is overridden in tests.
    function _blockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    /// @inheritdoc IClaimGTONV2
    function claim(address receiver, uint256 amount) public override {
        require(claimActivated, "can't claim");
        uint256 balance = balanceKeeper.balance(
            "EVM",
            abi.encodePacked(msg.sender)
        );
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
        voter.checkVoteBalances(balanceKeeper.userIdByChainAddress("EVM", abi.encodePacked(msg.sender)));
        governanceToken.transferFrom(wallet, receiver, amount);
        emit Claim(msg.sender, receiver, amount);
    }
}
