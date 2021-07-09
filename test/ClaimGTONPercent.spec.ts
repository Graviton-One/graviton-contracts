import { ethers, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { BalanceKeeperV2 } from '../typechain/BalanceKeeperV2'
import { VoterV2 } from '../typechain/VoterV2'
import { MockTimeClaimGTONPercent } from '../typechain/MockTimeClaimGTONPercent'
import { claimGTONPercentFixture, TEST_START_TIME } from './shared/fixtures'
import { EVM_CHAIN, expandTo18Decimals } from './shared/utilities'
import { expect } from './shared/expect'

describe('ClaimGTONPercent', () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let voter: VoterV2
  let claimGTON: MockTimeClaimGTONPercent

  beforeEach('deploy test contracts', async () => {
    ;({ token0, token1, token2, balanceKeeper, voter, claimGTON } = await loadFixture(claimGTONPercentFixture))
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper['add(string,bytes,uint256)'](EVM_CHAIN, wallet.address, expandTo18Decimals(100))
  })

  it('constructor initializes variables', async () => {
    expect(await claimGTON.owner()).to.eq(wallet.address)
    expect(await claimGTON.governanceToken()).to.eq(token0.address)
    expect(await claimGTON.wallet()).to.eq(wallet.address)
    expect(await claimGTON.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await claimGTON.voter()).to.eq(voter.address)
  })

  it('starting state after deployment', async () => {
    expect(await claimGTON.claimActivated()).to.eq(false)
    expect(await claimGTON.limitActivated()).to.eq(false)
    expect(await claimGTON.lastLimitTimestamp(wallet.address)).to.eq(0)
    expect(await claimGTON.limitMax(wallet.address)).to.eq(0)
  })

  describe('#setOwner', () => {
    it('fails if caller is not owner', async () => {
      await expect(claimGTON.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it('emits a SetOwner event', async () => {
      expect(await claimGTON.setOwner(other.address))
        .to.emit(claimGTON, 'SetOwner')
        .withArgs(wallet.address, other.address)
    })

    it('updates owner', async () => {
      await claimGTON.setOwner(other.address)
      expect(await claimGTON.owner()).to.eq(other.address)
    })

    it('cannot be called by original owner', async () => {
      await claimGTON.setOwner(other.address)
      await expect(claimGTON.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe('#setWallet', () => {
    it('fails if caller is not owner', async () => {
      await expect(claimGTON.connect(other).setWallet(wallet.address)).to.be.reverted
    })

    it('updates wallet', async () => {
      await claimGTON.setWallet(wallet.address)
      expect(await claimGTON.wallet()).to.eq(wallet.address)
    })

    it('emits event', async () => {
      await expect(claimGTON.setWallet(other.address))
        .to.emit(claimGTON, 'SetWallet')
        .withArgs(wallet.address, other.address)
    })
  })

  describe('#setVoter', () => {
    it('fails if caller is not owner', async () => {
      await expect(claimGTON.connect(other).setVoter(other.address)).to.be.reverted
    })

    it('updates voter', async () => {
      await claimGTON.setVoter(other.address)
      expect(await claimGTON.voter()).to.eq(other.address)
    })

    it('emits event', async () => {
      await expect(claimGTON.setVoter(other.address))
        .to.emit(claimGTON, 'SetVoter')
        .withArgs(voter.address, other.address)
    })
  })

  describe('#setClaimActivated', () => {
    it('fails if caller is not owner', async () => {
      await expect(claimGTON.connect(other).setClaimActivated(true)).to.be.reverted
    })

    it('sets permission to true', async () => {
      await claimGTON.setClaimActivated(true)
      expect(await claimGTON.claimActivated()).to.eq(true)
    })

    it('sets permission to false', async () => {
      await claimGTON.setClaimActivated(true)
      await claimGTON.setClaimActivated(false)
      expect(await claimGTON.claimActivated()).to.eq(false)
    })
  })

  describe('#setLimitActivated', () => {
    it('fails if caller is not owner', async () => {
      await expect(claimGTON.connect(other).setLimitActivated(true)).to.be.reverted
    })

    it('sets permission to true', async () => {
      await claimGTON.setLimitActivated(true)
      expect(await claimGTON.limitActivated()).to.eq(true)
    })

    it('sets permission to false', async () => {
      await claimGTON.setLimitActivated(true)
      await claimGTON.setLimitActivated(false)
      expect(await claimGTON.limitActivated()).to.eq(false)
    })
  })

  describe('#claim', () => {
    it('fails if claim has not been activated', async () => {
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await expect(claimGTON.claim(expandTo18Decimals(100))).to.be.reverted
    })

    it('fails if balance is smaller than claim amount', async () => {
      await claimGTON.setClaimActivated(true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await expect(claimGTON.claim(expandTo18Decimals(101))).to.be.reverted
    })

    it("fails if claimGTON is not allowed to subtract", async function () {
      await claimGTON.setClaimActivated(true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await expect(claimGTON.claim(expandTo18Decimals(100))).to.be.reverted
    })

    it("fails if claimGTON is not allowed to check balances", async function () {
      await claimGTON.setClaimActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await expect(claimGTON.claim(expandTo18Decimals(100))).to.be.reverted
    })

    it("fails if claimGTON is not allowed to transfer token", async function () {
      await claimGTON.setClaimActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await expect(claimGTON.claim(expandTo18Decimals(100))).to.be.reverted
    })

    it("transfers expandTo18Decimals(100)% if limit is not activated", async function () {
      await claimGTON.setClaimActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await claimGTON.claim(expandTo18Decimals(100))
      expect(await balanceKeeper['balance(string,bytes)'](EVM_CHAIN, wallet.address)).to.eq(0)
    })

    it("transfers less then 50% if limit is activated", async function () {
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await claimGTON.claim(expandTo18Decimals(50))
      expect(await balanceKeeper['balance(string,bytes)'](EVM_CHAIN, wallet.address)).to.eq(expandTo18Decimals(50))
    })

    it("does not transfer more than 50% at once if limit is activated", async function () {
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await expect(claimGTON.claim(expandTo18Decimals(51))).to.be.reverted
    })

    it("does not transfer more than 50% over the course of a day if limit is activated", async function () {
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await claimGTON.claim(expandTo18Decimals(50))
      await expect(claimGTON.claim(1)).to.be.reverted
    })

    it("transfers less than 75% of initial balance over the course of two days if limit is activated", async function () {
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await claimGTON.claim(expandTo18Decimals(50))
      await claimGTON.advanceTime(86401)
      await claimGTON.claim(expandTo18Decimals(25))
      expect(await balanceKeeper['balance(string,bytes)'](EVM_CHAIN, wallet.address)).to.eq(expandTo18Decimals(25))
    })

    it("updates limit variables if limit is activated", async function () {
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await claimGTON.claim(expandTo18Decimals(45))
      expect(await claimGTON.limitMax(wallet.address)).to.eq(expandTo18Decimals(5))
      expect(await claimGTON.lastLimitTimestamp(wallet.address)).to.eq(TEST_START_TIME)
    })

    it("emits event", async function () {
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, expandTo18Decimals(100))
      await expect(claimGTON.claim(expandTo18Decimals(50)))
          .to.emit(claimGTON, 'Claim')
          .withArgs(wallet.address, wallet.address, expandTo18Decimals(50))
    })
  })
})
