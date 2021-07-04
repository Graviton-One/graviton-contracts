import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { BalanceKeeper } from "../typechain/BalanceKeeper"
import { Voter } from "../typechain/Voter"
import { MockTimeClaimGTON } from "../typechain/MockTimeClaimGTON"
import { claimGTONFixture, TEST_START_TIME } from "./shared/fixtures"
import { expect } from "./shared/expect"

describe("ClaimGTON", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeper
  let voter: Voter
  let claimGTON: MockTimeClaimGTON

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, balanceKeeper, voter, claimGTON } =
      await loadFixture(claimGTONFixture))
  })

  it("constructor initializes variables", async () => {
    expect(await claimGTON.owner()).to.eq(wallet.address)
    expect(await claimGTON.governanceToken()).to.eq(token0.address)
    expect(await claimGTON.wallet()).to.eq(wallet.address)
    expect(await claimGTON.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await claimGTON.voter()).to.eq(voter.address)
  })

  it("starting state after deployment", async () => {
    expect(await claimGTON.claimActivated()).to.eq(false)
    expect(await claimGTON.limitActivated()).to.eq(false)
    expect(await claimGTON.lastLimitTimestamp(wallet.address)).to.eq(0)
    expect(await claimGTON.limitMax(wallet.address)).to.eq(0)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(claimGTON.connect(other).setOwner(wallet.address)).to.be
        .reverted
    })

    it("emits a SetOwner event", async () => {
      expect(await claimGTON.setOwner(other.address))
        .to.emit(claimGTON, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await claimGTON.setOwner(other.address)
      expect(await claimGTON.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await claimGTON.setOwner(other.address)
      await expect(claimGTON.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#setWallet", () => {
    it("fails if caller is not owner", async () => {
      await expect(claimGTON.connect(other).setWallet(wallet.address)).to.be
        .reverted
    })

    it("updates wallet", async () => {
      await claimGTON.setWallet(wallet.address)
      expect(await claimGTON.wallet()).to.eq(wallet.address)
    })
  })

  describe("#setVoter", () => {
    it("fails if caller is not owner", async () => {
      await expect(claimGTON.connect(other).setVoter(other.address)).to.be
        .reverted
    })

    it("updates voter", async () => {
      await claimGTON.setVoter(other.address)
      expect(await claimGTON.voter()).to.eq(other.address)
    })
  })

  describe("#setGovernanceToken", () => {
    it("fails if caller is not owner", async () => {
      await expect(claimGTON.connect(other).setGovernanceToken(other.address))
        .to.be.reverted
    })

    it("updates governance token", async () => {
      await claimGTON.setGovernanceToken(other.address)
      expect(await claimGTON.governanceToken()).to.eq(other.address)
    })
  })

  describe("#setBalanceKeeper", () => {
    it("fails if caller is not owner", async () => {
      await expect(claimGTON.connect(other).setBalanceKeeper(other.address)).to
        .be.reverted
    })

    it("updates governance token", async () => {
      await claimGTON.setBalanceKeeper(other.address)
      expect(await claimGTON.balanceKeeper()).to.eq(other.address)
    })
  })

  describe("#setClaimActivated", () => {
    it("fails if caller is not owner", async () => {
      await expect(claimGTON.connect(other).setClaimActivated(true)).to.be
        .reverted
    })

    it("sets permission to true", async () => {
      await claimGTON.setClaimActivated(true)
      expect(await claimGTON.claimActivated()).to.eq(true)
    })

    it("sets permission to false", async () => {
      await claimGTON.setClaimActivated(true)
      await claimGTON.setClaimActivated(false)
      expect(await claimGTON.claimActivated()).to.eq(false)
    })
  })

  describe("#setLimitActivated", () => {
    it("fails if caller is not owner", async () => {
      await expect(claimGTON.connect(other).setLimitActivated(true)).to.be
        .reverted
    })

    it("sets permission to true", async () => {
      await claimGTON.setLimitActivated(true)
      expect(await claimGTON.limitActivated()).to.eq(true)
    })

    it("sets permission to false", async () => {
      await claimGTON.setLimitActivated(true)
      await claimGTON.setLimitActivated(false)
      expect(await claimGTON.limitActivated()).to.eq(false)
    })
  })

  describe("#claim", () => {
    it("fails if claim has not been activated", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await expect(claimGTON.claim(100, other.address)).to.be.reverted
    })

    it("fails if balance is smaller than claim amount", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await expect(claimGTON.claim(101, other.address)).to.be.reverted
    })

    it("fails if claimGTON is not allowed to subtract", async function () {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await expect(claimGTON.claim(100, other.address)).to.be.reverted
    })

    it("fails if claimGTON is not allowed to check balances", async function () {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await expect(claimGTON.claim(100, other.address)).to.be.reverted
    })

    it("fails if claimGTON is not allowed to transfer token", async function () {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await expect(claimGTON.claim(100, other.address)).to.be.reverted
    })

    it("transfers 100% if limit is not activated", async function () {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await claimGTON.claim(100, other.address)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(0)
    })

    it("transfers less then 50% if limit is activated", async function () {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await claimGTON.claim(50, other.address)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(50)
    })

    it("does not transfer more than 50% at once if limit is activated", async function () {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await expect(claimGTON.claim(51, other.address)).to.be.reverted
    })

    it("does not transfer more than 50% over the course of a day if limit is activated", async function () {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await claimGTON.claim(50, other.address)
      await expect(claimGTON.claim(1, other.address)).to.be.reverted
    })

    it("transfers less than 75% of initial balance over the course of two days if limit is activated", async function () {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await claimGTON.claim(50, other.address)
      await claimGTON.advanceTime(86401)
      await claimGTON.claim(25, other.address)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(25)
    })

    it("updates limit variables if limit is activated", async function () {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await claimGTON.claim(45, other.address)
      expect(await claimGTON.limitMax(wallet.address)).to.eq(5)
      expect(await claimGTON.lastLimitTimestamp(wallet.address)).to.eq(
        TEST_START_TIME
      )
    })

    it("emits event", async function () {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await claimGTON.setClaimActivated(true)
      await claimGTON.setLimitActivated(true)
      await balanceKeeper.setCanSubtract(claimGTON.address, true)
      await voter.setCanCheck(claimGTON.address, true)
      await token0.approve(claimGTON.address, 100)
      await expect(claimGTON.claim(50, other.address))
        .to.emit(claimGTON, "Claim")
        .withArgs(wallet.address, other.address, 50)
    })
  })
})
