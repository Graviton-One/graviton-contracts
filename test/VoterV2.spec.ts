import { ethers, waffle } from "hardhat"
import { BalanceKeeperV2 } from "../typechain/BalanceKeeperV2"
import { VoterV2 } from "../typechain/VoterV2"
import { voterV2Fixture } from "./shared/fixtures"
import { EVM_CHAIN } from "./shared/utilities"
import { expect } from "./shared/expect"

describe("VoterV2", () => {
  const [wallet, other, wallet2] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let voter: VoterV2
  let balanceKeeper: BalanceKeeperV2

  beforeEach("deploy test contracts", async () => {
    ;({ balanceKeeper, voter } = await loadFixture(voterV2Fixture))
    await balanceKeeper.setCanOpen(wallet.address, true)
    await balanceKeeper.open(EVM_CHAIN, wallet.address)
    await balanceKeeper.setCanAdd(wallet.address, true)
    await balanceKeeper["add(string,bytes,uint256)"](
      EVM_CHAIN,
      wallet.address,
      "100"
    )
    await balanceKeeper.open(EVM_CHAIN, wallet2.address)
    await balanceKeeper["add(string,bytes,uint256)"](
      EVM_CHAIN,
      wallet2.address,
      "100"
    )
  })

  it("constructor initializes variables", async () => {
    expect(await voter.owner()).to.eq(wallet.address)
    expect(await voter.balanceKeeper()).to.eq(balanceKeeper.address)
  })

  it("starting state after deployment", async () => {
    expect(await voter.totalRounds()).to.eq(0)
    await expect(voter.activeRounds(0)).to.be.reverted
    await expect(voter.finalizedRounds(0)).to.be.reverted
    await expect(voter.roundName(0)).to.be.reverted
    await expect(voter.roundName(1)).to.be.reverted
    await expect(voter.optionName(0, 0)).to.be.reverted
    await expect(voter.optionName(1, 0)).to.be.reverted
    expect(await voter.votesForOption(0, 0)).to.eq(0)
    expect(await voter.votesForOption(1, 0)).to.eq(0)
    expect(await voter.votesInRoundByUser(0, 0)).to.eq(0)
    expect(await voter.votesInRoundByUser(0, 1)).to.eq(0)
    expect(await voter.votesInRoundByUser(1, 0)).to.eq(0)
    expect(await voter.votesInRoundByUser(1, 1)).to.eq(0)
    expect(await voter.votesForOptionByUser(0, 0, 0)).to.eq(0)
    expect(await voter.votesForOptionByUser(0, 1, 0)).to.eq(0)
    expect(await voter.votesForOptionByUser(1, 0, 0)).to.eq(0)
    expect(await voter.votesForOptionByUser(1, 1, 0)).to.eq(0)
    expect(await voter.userVotedInRound(0, 0)).to.eq(false)
    expect(await voter.userVotedInRound(0, 1)).to.eq(false)
    expect(await voter.userVotedForOption(0, 0, 0)).to.eq(false)
    expect(await voter.userVotedForOption(0, 0, 1)).to.eq(false)
    expect(await voter.userVotedForOption(0, 1, 0)).to.eq(false)
    expect(await voter.userVotedForOption(0, 1, 1)).to.eq(false)
    expect(await voter.userVotedForOption(1, 0, 0)).to.eq(false)
    expect(await voter.userVotedForOption(1, 0, 1)).to.eq(false)
    expect(await voter.userVotedForOption(1, 1, 0)).to.eq(false)
    expect(await voter.userVotedForOption(1, 1, 1)).to.eq(false)
    expect(await voter.totalUsersInRound(0)).to.eq(0)
    expect(await voter.totalUsersInRound(0)).to.eq(0)
    expect(await voter.totalUsersForOption(0, 0)).to.eq(0)
    expect(await voter.canCheck(wallet.address)).to.eq(false)
    expect(await voter.canCheck(other.address)).to.eq(false)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(voter.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it("emits a SetOwner event", async () => {
      expect(await voter.setOwner(other.address))
        .to.emit(voter, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await voter.setOwner(other.address)
      expect(await voter.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await voter.setOwner(other.address)
      await expect(voter.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#optionName", () => {
    it("fails if there is no round", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await expect(voter.optionName(1, 0)).to.be.reverted
    })

    it("fails if there is no option", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await expect(voter.optionName(0, 2)).to.be.reverted
    })

    it("returns the option name", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.optionName(0, 0)).to.eq("option1")
    })
  })

  describe("#startRound", () => {
    it("fails if caller is not owner", async () => {
      await expect(
        voter.connect(other).startRound("name", ["option1", "option2"])
      ).to.be.reverted
    })

    it("sets round name", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.roundName(0)).to.eq("name")
    })

    it("sets round options", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.optionName(0, 0)).to.eq("option1")
      expect(await voter.optionName(0, 1)).to.eq("option2")
    })

    it("sets initial votes to 0", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.votesForOption(0, 0)).to.eq(0)
      expect(await voter.votesForOption(0, 1)).to.eq(0)
    })

    it("appends active rounds", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.activeRounds(0)).to.eq(0)
      expect(await voter.totalActiveRounds()).to.eq(1)
    })

    it("increments the number of rounds", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.totalRounds()).to.eq(1)
    })

    it("emits event", async () => {
      await expect(voter.startRound("name", ["option1", "option2"]))
        .to.emit(voter, "StartRound")
        .withArgs(wallet.address, 1, "name", ["option1", "option2"])
    })
  })

  describe("#finalizeRound", () => {
    it("fails if caller is not owner", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await expect(voter.connect(other).finalizeRound(0)).to.be.reverted
    })

    it("removes round from active rounds", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.finalizeRound(0)
      await expect(voter.activeRounds(0)).to.be.reverted
      expect(await voter.totalActiveRounds()).to.eq(0)
    })

    it("removes round from active rounds", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.startRound("name2", ["option1", "option2"])
      await voter.finalizeRound(1)
      await expect(voter.activeRounds(1)).to.be.reverted
      expect(await voter.totalActiveRounds()).to.eq(1)
    })

    it("adds round to finalized rounds", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.finalizeRound(0)
      expect(await voter.finalizedRounds(0)).to.eq(0)
      expect(await voter.totalFinalizedRounds()).to.eq(1)
    })

    it("emits event", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await expect(voter.finalizeRound(0))
        .to.emit(voter, "FinalizeRound")
        .withArgs(wallet.address, 0)
    })
  })

  describe("#castVotes(uint256,uint256[])", () => {
    it("fails if the round has not started", async () => {
      await expect(voter["castVotes(uint256,uint256[])"](0, [0, 0])).to.be
        .reverted
    })

    it("fails if the round has been finalized", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.finalizeRound(0)
      await expect(voter["castVotes(uint256,uint256[])"](0, [0, 0])).to.be
        .reverted
    })

    it("fails if the number of votes is larger than the number of options", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await expect(voter["castVotes(uint256,uint256[])"](0, [0, 0, 0])).to.be
        .reverted
    })

    it("fails if user balance is smaller than the sum of votes", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await expect(voter["castVotes(uint256,uint256[])"](0, [0, 101])).to.be
        .reverted
    })

    it("updates user votes for the option", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.votesForOptionByUser(0, 0, 0)).to.eq(20)
      expect(await voter.votesForOptionByUser(0, 1, 0)).to.eq(40)
    })

    it("updates user votes in the round", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.votesInRoundByUser(0, 0)).to.eq(60)
    })

    it("records that the user has voted for the option", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.userVotedForOption(0, 0, 0)).to.eq(true)
      expect(await voter.userVotedForOption(0, 1, 0)).to.eq(true)
    })

    it("does not record that the user has voted for the option if the vote is 0", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [0, 60])
      expect(await voter.userVotedForOption(0, 0, 0)).to.eq(false)
      expect(await voter.userVotedForOption(0, 1, 0)).to.eq(true)
    })

    it("records that the user has voted in the round", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.userVotedInRound(0, 0)).to.eq(true)
    })

    it("does not record that the user has voted in the round if the vote is 0", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [0, 0])
      expect(await voter.userVotedInRound(0, 0)).to.eq(false)
    })

    it("increments the number of users for the option", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.totalUsersForOption(0, 0)).to.eq(1)
      expect(await voter.totalUsersForOption(0, 1)).to.eq(1)
    })

    it("increments the number of users in the round", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.totalUsersInRound(0)).to.eq(1)
    })

    it("does not increment the number of users for the option if the user vote is 0", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [0, 60])
      expect(await voter.totalUsersForOption(0, 0)).to.eq(0)
      expect(await voter.totalUsersForOption(0, 1)).to.eq(1)
    })

    it("does not increment the number of users in the round if the sum of votes is 0", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [0, 0])
      expect(await voter.totalUsersInRound(0)).to.eq(0)
    })

    it("overwrites previous votes", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.votesForOptionByUser(0, 0, 0)).to.eq(20)
      expect(await voter.votesForOptionByUser(0, 1, 0)).to.eq(40)
      await voter["castVotes(uint256,uint256[])"](0, [30, 30])
      expect(await voter.votesForOptionByUser(0, 0, 0)).to.eq(30)
      expect(await voter.votesForOptionByUser(0, 1, 0)).to.eq(30)
    })

    it("decrements the number of users for the option if the new user vote is 0", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.totalUsersForOption(0, 0)).to.eq(1)
      await voter["castVotes(uint256,uint256[])"](0, [0, 60])
      expect(await voter.totalUsersForOption(0, 0)).to.eq(0)
    })

    it("decrements the number of users in the round if the new sum of votes is 0", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.totalUsersInRound(0)).to.eq(1)
      await voter["castVotes(uint256,uint256[])"](0, [0, 0])
      expect(await voter.totalUsersInRound(0)).to.eq(0)
    })

    it("increments the number of users for two users", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.connect(wallet)["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.totalUsersForOption(0, 0)).to.eq(1)
      await voter.connect(wallet2)["castVotes(uint256,uint256[])"](0, [10, 60])
      expect(await voter.totalUsersForOption(0, 0)).to.eq(2)
    })

    it("emits event", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await expect(voter["castVotes(uint256,uint256[])"](0, [0, 0]))
        .to.emit(voter, "CastVotes")
        .withArgs(wallet.address, 0, 0, [0, 0])
    })
  })

  describe("#castVotes(uint256,uint256,uint256[])", () => {
    it("fails if caller is not allowed to cast votes", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await expect(
        voter["castVotes(uint256,uint256,uint256[])"](0, 0, [20, 40])
      ).to.be.reverted
    })

    it("casts votes", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.setCanCastVotes(other.address, true)
      voter = voter.connect(other)
      await voter["castVotes(uint256,uint256,uint256[])"](0, 0, [20, 40])
      expect(await voter.totalUsersInRound(0)).to.eq(1)
    })
  })

  describe("#isActiveRound", () => {
    it("returns false if the round has not been started", async () => {
      expect(await voter.isActiveRound(0)).to.eq(false)
    })

    it("returns false if the round has been finalized", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.finalizeRound(0)
      expect(await voter.isActiveRound(0)).to.eq(false)
    })

    it("returns true if the round is active", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.isActiveRound(0)).to.eq(true)
    })

    it("returns true if the round is active", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.startRound("name2", ["option1", "option2"])
      expect(await voter.isActiveRound(1)).to.eq(true)
    })
  })

  describe("#isFinalizedRound", () => {
    it("returns false if the round has not been started", async () => {
      expect(await voter.isFinalizedRound(0)).to.eq(false)
    })

    it("returns false if the round has not been finalized", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.isFinalizedRound(0)).to.eq(false)
    })

    it("returns true if the round has been finalized", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.finalizeRound(0)
      expect(await voter.isFinalizedRound(0)).to.eq(true)
    })

    it("returns true if the round has been finalized", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.finalizeRound(0)
      await voter.startRound("name2", ["option1", "option2"])
      await voter.finalizeRound(1)
      expect(await voter.isFinalizedRound(1)).to.eq(true)
    })
  })

  describe("#votesInRound", () => {
    it("returns 0 if the round has not been started", async () => {
      expect(await voter.votesInRound(0)).to.eq(0)
    })

    it("returns 0 if there are no votes in the round", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.votesInRound(0)).to.eq(0)
    })

    it("returns the sum of votes in the round", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.votesInRound(0)).to.eq(60)
    })
  })

  describe("#totalActiveRounds", () => {
    it("returns 0 if there are no active rounds", async () => {
      expect(await voter.totalActiveRounds()).to.eq(0)
    })

    it("returns the number of active rounds", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.totalActiveRounds()).to.eq(1)
    })
  })

  describe("#totalFinalizedRounds", () => {
    it("returns 0 if there are no finalized rounds", async () => {
      expect(await voter.totalFinalizedRounds()).to.eq(0)
    })

    it("returns the number of finalized rounds", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter.finalizeRound(0)
      expect(await voter.totalFinalizedRounds()).to.eq(1)
    })
  })

  describe("#totalRoundOptions", () => {
    it("returns 0 if the round has not been started", async () => {
      expect(await voter.totalRoundOptions(0)).to.eq(0)
    })

    it("returns the number of options in the round", async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.totalRoundOptions(0)).to.eq(2)
    })
  })

  describe("#setCanCastVotes", () => {
    it("fails if caller is not owner", async () => {
      await expect(voter.connect(other).setCanCastVotes(other.address, true)).to
        .be.reverted
    })

    it("updates permission", async () => {
      await voter.setCanCastVotes(other.address, true)
      expect(await voter.canCastVotes(other.address)).to.eq(true)
    })

    it("emits event", async () => {
      await expect(voter.setCanCastVotes(other.address, true))
        .to.emit(voter, "SetCanCastVotes")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#setCanCheck", () => {
    it("fails if caller is not owner", async () => {
      await expect(voter.connect(other).setCanCheck(other.address, true)).to.be
        .reverted
    })

    it("updates permission", async () => {
      await voter.setCanCheck(other.address, true)
      expect(await voter.canCheck(other.address)).to.eq(true)
    })

    it("emits event", async () => {
      await expect(voter.setCanCheck(other.address, true))
        .to.emit(voter, "SetCanCheck")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#checkVoteBalances", () => {
    it("fails if caller is not allowed to check vote balances", async () => {
      await expect(voter.checkVoteBalances(0)).to.be.reverted
    })

    it("does not update votes if the new balance is still larger than the number of votes", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.votesForOptionByUser(0, 0, 0)).to.eq(20)
      expect(await voter.votesForOptionByUser(0, 1, 0)).to.eq(40)
      expect(await voter.votesInRoundByUser(0, 0)).to.eq(60)
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper["subtract(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        30
      )
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(70)
      await voter.setCanCheck(wallet.address, true)
      await voter.checkVoteBalances(0)
      expect(await voter.votesForOptionByUser(0, 0, 0)).to.eq(20)
      expect(await voter.votesForOptionByUser(0, 1, 0)).to.eq(40)
      expect(await voter.votesInRoundByUser(0, 0)).to.eq(60)
    })

    it("decreases votes proportionally if the number of votes is larger than the new balance", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(await voter.votesForOptionByUser(0, 0, 0)).to.eq(20)
      expect(await voter.votesForOptionByUser(0, 1, 0)).to.eq(40)
      expect(await voter.votesInRoundByUser(0, 0)).to.eq(60)
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper["subtract(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        70
      )
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(30)
      await voter.setCanCheck(wallet.address, true)
      await voter.checkVoteBalances(0)
      expect(await voter.votesForOptionByUser(0, 0, 0)).to.eq(10)
      expect(await voter.votesForOptionByUser(0, 1, 0)).to.eq(20)
      expect(await voter.votesInRoundByUser(0, 0)).to.eq(30)
    })

    it("does not emit event if a user is not eligible for checking balances", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper["subtract(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        30
      )
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(70)
      await voter.setCanCheck(wallet.address, true)
      await expect(voter.checkVoteBalances(0)).to.not.emit(
        voter,
        "CheckVoteBalance"
      )
    })

    it("emits event", async () => {
      await voter.startRound("name", ["option1", "option2"])
      await voter["castVotes(uint256,uint256[])"](0, [20, 40])
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper["subtract(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        70
      )
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(30)
      await voter.setCanCheck(wallet.address, true)
      await expect(voter.checkVoteBalances(0))
        .to.emit(voter, "CheckVoteBalance")
        .withArgs(wallet.address, 0, 30)
    })
  })
})
