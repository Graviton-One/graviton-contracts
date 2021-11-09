import { ethers, waffle } from "hardhat"
import { BigNumber } from "ethers"
import { TestERC20 } from "../typechain/TestERC20"
import { BalanceAdderEB } from "../typechain/BalanceAdderEB"
import { ImpactEB } from "../typechain/ImpactEB"
import { BalanceKeeper } from "../typechain/BalanceKeeper"
import { MockTimeFarmCurved } from "../typechain/MockTimeFarmCurved"
import { balanceAdderEBFixture } from "./shared/fixtures"

import { expect } from "./shared/expect"

describe("BalanceAdderEB", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let farm: MockTimeFarmCurved
  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let impactEB: ImpactEB
  let balanceKeeper: BalanceKeeper
  let balanceAdderEB: BalanceAdderEB
  let totalUsers: BigNumber

  beforeEach("deploy test contracts", async () => {
    ;({
      farm,
      token0,
      token1,
      token2,
      impactEB,
      balanceKeeper,
      balanceAdderEB,
    } = await loadFixture(balanceAdderEBFixture))
    totalUsers = await impactEB.userCount()
  })

  it("constructor initializes variables", async () => {
    expect(await balanceAdderEB.farm()).to.eq(farm.address)
    expect(await balanceAdderEB.impactEB()).to.eq(impactEB.address)
    expect(await balanceAdderEB.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await balanceAdderEB.totalUsers()).to.eq(totalUsers)
  })

  it("starting state after deployment", async () => {
    expect(await balanceAdderEB.lastUser()).to.eq(0)
    expect(await balanceAdderEB.lastPortion(wallet.address)).to.eq(0)
    expect(await balanceAdderEB.lastPortion(other.address)).to.eq(0)
  })

  describe("#processBalances", () => {
    it("fails if not allowed to add value", async () => {
      await expect(balanceAdderEB.processBalances(1)).to.be.reverted
    })

    it("adds no value if farm is not started", async () => {
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(1)
      expect(await balanceAdderEB.lastPortion(wallet.address)).to.eq(0)
      expect(await balanceAdderEB.lastPortion(other.address)).to.eq(0)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(0)
      expect(await balanceKeeper.userBalance(other.address)).to.eq(0)
    })

    it("updates lastUser when step is less than total users", async () => {
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(1)
      expect(await balanceAdderEB.lastUser()).to.eq(1)
    })

    it("does not change lastUser if step is zero", async () => {
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(1)
      await balanceAdderEB.processBalances(0)
      expect(await balanceAdderEB.lastUser()).to.eq(1)
    })

    it("does not add values if step is zero", async () => {
      await farm.startFarming()
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(0)
      expect(await balanceAdderEB.lastPortion(wallet.address)).to.eq(0)
      expect(await balanceAdderEB.lastPortion(other.address)).to.eq(0)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(0)
      expect(await balanceKeeper.userBalance(other.address)).to.eq(0)
    })

    it("sets lastUser to zero when step is equal to total users", async () => {
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(2)
      expect(await balanceAdderEB.lastUser()).to.eq(0)
    })

    it("sets lastUser to zero when step is larger than total users", async () => {
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(3)
      expect(await balanceAdderEB.lastUser()).to.eq(0)
    })

    it("adds value to users if caled once", async () => {
      await farm.startFarming()
      farm.advanceTime(1209600)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(2)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(
        "91844130687953401335558"
      )
      expect(await balanceKeeper.userBalance(other.address)).to.eq(
        "91844130687953401335558"
      )
    })

    it("adds value to users if caled twice", async () => {
      await farm.startFarming()
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(2)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(
        "48022336552501505027952"
      )
      expect(await balanceKeeper.userBalance(other.address)).to.eq(
        "48022336552501505027952"
      )
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await balanceAdderEB.processBalances(2)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(
        "91844130687953401335558"
      )
      expect(await balanceKeeper.userBalance(other.address)).to.eq(
        "91844130687953401335558"
      )
    })

    it("adds value to only one user if step is 1", async () => {
      await farm.startFarming()
      farm.advanceTime(1209600)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(1)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(
        "91844130687953401335558"
      )
      expect(await balanceKeeper.userBalance(other.address)).to.eq("0")
    })

    it("updates last portion if caled once", async () => {
      await farm.startFarming()
      farm.advanceTime(1209600)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(2)
      expect(await balanceAdderEB.lastPortion(wallet.address)).to.eq(
        "91844130687953401335558"
      )
      expect(await balanceAdderEB.lastPortion(other.address)).to.eq(
        "91844130687953401335558"
      )
    })

    it("updates last portion if called twice", async () => {
      await farm.startFarming()
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(2)
      expect(await balanceAdderEB.lastPortion(wallet.address)).to.eq(
        "48022336552501505027952"
      )
      expect(await balanceAdderEB.lastPortion(other.address)).to.eq(
        "48022336552501505027952"
      )
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await balanceAdderEB.processBalances(2)
      expect(await balanceAdderEB.lastPortion(wallet.address)).to.eq(
        "91844130687953401335558"
      )
      expect(await balanceAdderEB.lastPortion(other.address)).to.eq(
        "91844130687953401335558"
      )
    })

    it("updates last portion for only one user if step is 1", async () => {
      await farm.startFarming()
      farm.advanceTime(1209600)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceAdderEB.address, true)
      await balanceAdderEB.processBalances(1)
      expect(await balanceAdderEB.lastPortion(wallet.address)).to.eq(
        "91844130687953401335558"
      )
      expect(await balanceAdderEB.lastPortion(other.address)).to.eq("0")
    })
  })
})
