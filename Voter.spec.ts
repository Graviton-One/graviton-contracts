import { ethers, waffle } from 'hardhat'
import { BalanceKeeper } from '../typechain/BalanceKeeper'
import { Voter } from '../typechain/Voter'
import { voterFixture } from './shared/fixtures'
import { expect } from './shared/expect'

describe('BalanceEB', () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let voter: Voter
  let balanceKeeper: BalanceKeeper

  beforeEach('deploy test contracts', async () => {
    ;({ balanceKeeper, voter } = await loadFixture(voterFixture))
  })

  it('constructor initializes variables', async () => {
    expect(await voter.owner()).to.eq(wallet.address)
    expect(await voter.balanceKeeper()).to.eq(balanceKeeper.address)
  })

  it('starting state after deployment', async () => {
    expect(await voter.roundCount()).to.eq(0)
    await expect(voter.activeRounds(0)).to.be.reverted
    await expect(voter.pastRounds(0)).to.be.reverted
    expect(await voter.roundName(0)).to.eq("")
    expect(await voter.roundName(1)).to.eq("")
    await expect(voter.roundOptions(0, 0)).to.be.reverted
    await expect(voter.roundOptions(1, 0)).to.be.reverted
    await expect(voter.votesForOption(0, 0)).to.be.reverted
    await expect(voter.votesForOption(1, 0)).to.be.reverted
    expect(await voter.votesInRoundByUser(0, wallet.address)).to.eq(0)
    expect(await voter.votesInRoundByUser(0, other.address)).to.eq(0)
    expect(await voter.votesInRoundByUser(1, wallet.address)).to.eq(0)
    expect(await voter.votesInRoundByUser(1, other.address)).to.eq(0)
    await expect(voter.votesForOptionByUser(0, wallet.address, 0)).to.be.reverted
    await expect(voter.votesForOptionByUser(0, other.address, 0)).to.be.reverted
    await expect(voter.votesForOptionByUser(1, wallet.address, 0)).to.be.reverted
    await expect(voter.votesForOptionByUser(1, other.address, 0)).to.be.reverted
    expect(await voter.userVotedInRound(0, wallet.address)).to.eq(false)
    expect(await voter.userVotedInRound(0, other.address)).to.eq(false)
    expect(await voter.userVotedForOption(0, 0, wallet.address)).to.eq(false)
    expect(await voter.userVotedForOption(0, 0, other.address)).to.eq(false)
    expect(await voter.userVotedForOption(0, 1, wallet.address)).to.eq(false)
    expect(await voter.userVotedForOption(0, 1, other.address)).to.eq(false)
    expect(await voter.userVotedForOption(1, 0, wallet.address)).to.eq(false)
    expect(await voter.userVotedForOption(1, 0, other.address)).to.eq(false)
    expect(await voter.userVotedForOption(1, 1, wallet.address)).to.eq(false)
    expect(await voter.userVotedForOption(1, 1, other.address)).to.eq(false)
    expect(await voter.userCountInRound(0)).to.eq(0)
    expect(await voter.userCountInRound(0)).to.eq(0)
    expect(await voter.userCountForOption(0, 0)).to.eq(0)
    expect(await voter.canCheck(wallet.address)).to.eq(false)
    expect(await voter.canCheck(other.address)).to.eq(false)
  })

  describe('#setOwner', () => {
    it('fails if caller is not owner', async () => {
      await expect(voter.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it('emits a SetOwner event', async () => {
      expect(await voter.setOwner(other.address))
        .to.emit(voter, 'SetOwner')
        .withArgs(wallet.address, other.address)
    })

    it('updates owner', async () => {
      await voter.setOwner(other.address)
      expect(await voter.owner()).to.eq(other.address)
    })

    it('cannot be called by original owner', async () => {
      await voter.setOwner(other.address)
      await expect(voter.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe('#startRound', () => {
    it('fails if caller is not owner', async () => {
      await expect(voter.connect(other).startRound("name", ["option1", "option2"])).to.be.reverted
    })
    it('sets round name', async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.roundName(0)).to.eq("name")
    })

    it('sets round options', async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.roundOptions(0, 0)).to.eq("option1")
      expect(await voter.roundOptions(0, 1)).to.eq("option2")
    })

    it('sets initial votes to 0', async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.votesForOption(0, 0)).to.eq(0)
      expect(await voter.votesForOption(0, 1)).to.eq(0)
    })

    it('appends active rounds', async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.activeRounds(0)).to.eq(0)
    })

    it('increments round count', async () => {
      await voter.startRound("name", ["option1", "option2"])
      expect(await voter.roundCount()).to.eq(1)
    })

    it('emits event', async () => {
      await expect(voter.startRound("name", ["option1", "option2"]))
        .to.emit(voter, 'StartRound')
        .withArgs(wallet.address, 1, "name", ["option1", "option2"])
    })
  })

  describe('#castVotes', () => {
    it('emits event', async () => {})
  })

  describe('#finalizeRound', () => {
    it('fails if caller is not owner', async () => {
      await voter.startRound("name", ["option1", "option2"])
      await expect(voter.connect(other).finalizeRound(0)).to.be.reverted
    })

    it('emits event', async () => {})
  })

  describe('#isActiveRound', () => {})

  describe('#votesInRound', () => {})

  describe('#activeRoundCount', () => {})

  describe('#pastRoundCount', () => {})

  describe('#roundOptionCount', () => {})

  describe('#setCanCheck', () => {
    it('fails if caller is not owner', async () => {
      await expect(voter.connect(other).setCanCheck(other.address, true)).to.be.reverted
    })

    it('emits event', async () => {})
  })

  describe('#checkVoteBalances', () => {
    it('emits event', async () => {})
  })
})
