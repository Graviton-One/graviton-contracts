import { ethers, waffle } from "hardhat"
import { BalanceKeeper } from "../typechain/BalanceKeeper"
import { BalanceAdderStaking } from "../typechain/BalanceAdderStaking"
import { MockTimeFarmLinear } from "../typechain/MockTimeFarmLinear"
import { balanceAdderStakingFixture } from "./shared/fixtures"
import { expect } from "./shared/expect"

describe("BalanceAdderStaking", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let farm: MockTimeFarmLinear
  let balanceKeeper: BalanceKeeper
  let balanceAdderStaking: BalanceAdderStaking

  beforeEach("deploy test contracts", async () => {
    ;({ farm, balanceKeeper, balanceAdderStaking } = await loadFixture(
      balanceAdderStakingFixture
    ))
  })

  async function farmForAWeek() {
    await farm.startFarming()
    farm.advanceTime(604800)
    await farm.unlockAsset()
  }

  async function give100ToEach() {
    await balanceKeeper.setCanAdd(wallet.address, true)
    await balanceKeeper.add(wallet.address, 100)
    await balanceKeeper.add(other.address, 100)
  }

  it("constructor initializes variables", async () => {
    expect(await balanceAdderStaking.farm()).to.eq(farm.address)
    expect(await balanceAdderStaking.balanceKeeper()).to.eq(
      balanceKeeper.address
    )
  })

  it("starting state after deployment", async () => {
    expect(await balanceAdderStaking.lastUser()).to.eq(0)
    expect(await balanceAdderStaking.totalUsers()).to.eq(0)
    expect(await balanceAdderStaking.lastPortion()).to.eq(0)
    expect(await balanceAdderStaking.currentPortion()).to.eq(0)
    expect(await balanceAdderStaking.totalBalance()).to.eq(0)
    expect(await balanceAdderStaking.totalUnlocked()).to.eq(0)
  })

  describe("#processBalances", () => {
    it("does not update balances if the farming has started and there are no users on the balance keeper", async () => {
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(0)
      expect(await balanceKeeper.totalBalance()).to.eq(0)
      await farmForAWeek()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(1)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(0)
      expect(await balanceKeeper.totalBalance()).to.eq(0)
    })

    it("updates current portion if the farming has started and there are no users on the balance keeper", async () => {
      await farmForAWeek()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(1)
      expect(await balanceAdderStaking.lastPortion()).to.eq(
        "7000000000000000000000"
      )
    })

    it("updates last portion if the farming has started and there are no users on the balance keeper", async () => {
      await farmForAWeek()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(1)
      expect(await balanceAdderStaking.lastPortion()).to.eq(
        "7000000000000000000000"
      )
    })

    it("does not update balances if the farming has not started", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(1)
      expect(await balanceAdderStaking.lastPortion()).to.eq(0)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(100)
    })

    it("fails if all funds have been withdrawn from the balance keeper", async () => {
      await farmForAWeek()
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.subtract(wallet.address, 100)
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await expect(balanceAdderStaking.processBalances(1)).to.be.reverted
    })

    it("updates final value when step is less than total users", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(1)
      expect(await balanceAdderStaking.lastUser()).to.eq(1)
    })

    it("does not change final value if step is zero", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(1)
      await balanceAdderStaking.processBalances(0)
      expect(await balanceAdderStaking.lastUser()).to.eq(1)
    })

    it("does not update balances if step is zero", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(0)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(100)
      expect(await balanceKeeper.userBalance(other.address)).to.eq(100)
    })

    it("sets final value to zero when step is equal to total users", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(2)
      expect(await balanceAdderStaking.lastUser()).to.eq(0)
    })

    it("sets final value to zero when step is larger than total users", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(3)
      expect(await balanceAdderStaking.lastUser()).to.eq(0)
    })

    it("adds value to users if caled once", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(2)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(
        "3500000000000000000100"
      )
      expect(await balanceKeeper.userBalance(other.address)).to.eq(
        "3500000000000000000100"
      )
    })

    it("adds value to users if caled twice", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(1)
      await balanceAdderStaking.processBalances(1)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(
        "3500000000000000000100"
      )
      expect(await balanceKeeper.userBalance(other.address)).to.eq(
        "3500000000000000000100"
      )
    })

    it("adds value to only one user if step is 1", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(1)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(
        "3500000000000000000100"
      )
      expect(await balanceKeeper.userBalance(other.address)).to.eq("100")
    })

    it("does not update last portion if the step has not reached the number of users", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(1)
      expect(await balanceAdderStaking.lastPortion()).to.eq("0")
    })

    it("updates last portion if the step has not reached the number of users", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(2)
      expect(await balanceAdderStaking.lastPortion()).to.eq(
        "7000000000000000000000"
      )
    })

    it("preserves proportions after two farming rounds", async () => {
      await farmForAWeek()
      await give100ToEach()
      await balanceKeeper.setCanAdd(balanceAdderStaking.address, true)
      await balanceAdderStaking.processBalances(2)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(
        "3500000000000000000100"
      )
      expect(await balanceKeeper.userBalance(other.address)).to.eq(
        "3500000000000000000100"
      )
      await farmForAWeek()
      await balanceAdderStaking.processBalances(2)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(
        "7000000000000000000100"
      )
      expect(await balanceKeeper.userBalance(other.address)).to.eq(
        "7000000000000000000100"
      )
    })
  })
})
