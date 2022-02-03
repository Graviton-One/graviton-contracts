import { ethers, waffle } from "hardhat"
import { Contract } from "ethers"
import { expect } from "./shared/expect"
import { TestERC20 } from "../typechain/TestERC20"
import { ImpactEB } from "../typechain/ImpactEB"
import { MockTimeFarmCurved } from "../typechain/MockTimeFarmCurved"
import { MockTimeFarmLinear } from "../typechain/MockTimeFarmLinear"
import { BalanceKeeperV2 } from "../typechain/BalanceKeeperV2"
import { LPKeeperV2 } from "../typechain/LPKeeperV2"
import { SharesEB } from "../typechain/SharesEB"
import { SharesLP } from "../typechain/SharesLP"
import { BalanceAdderV3 } from "../typechain/BalanceAdderV3"
import { balanceAdderV3Fixture } from "./shared/fixtures"
import { EVM_CHAIN, MAX_UINT } from "./shared/utilities"

describe("BalanceAdderV3", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let farm: MockTimeFarmLinear
  let lpKeeper: LPKeeperV2
  let sharesLP1: SharesLP
  let sharesLP2: SharesLP
  let balanceAdder: BalanceAdderV3
  let mockFarm: Contract

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, balanceKeeper, farm, lpKeeper, balanceAdder } =
      await loadFixture(balanceAdderV3Fixture))

    // mock contracts so first processBalances gives 100 to each
    // mock farm always has 1000 unlocked
    const farmABI = ["function totalUnlocked() view returns (uint256)"]
    mockFarm = await waffle.deployMockContract(wallet, farmABI)
    await mockFarm.mock.totalUnlocked.returns(1000)
  })

  async function openWallet() {
    await balanceKeeper.setCanOpen(wallet.address, true)
    await balanceKeeper.open(EVM_CHAIN, wallet.address)
  }
  async function openOther() {
    await balanceKeeper.setCanOpen(wallet.address, true)
    await balanceKeeper.open(EVM_CHAIN, other.address)
  }
  async function add(user: string, amount: number) {
    await balanceKeeper.setCanAdd(wallet.address, true)
    await balanceKeeper["add(string,bytes,uint256)"](EVM_CHAIN, user, amount)
  }
  async function subtract(user: string, amount: number) {
    await balanceKeeper.setCanSubtract(wallet.address, true)
    await balanceKeeper["subtract(string,bytes,uint256)"](
      EVM_CHAIN,
      user,
      amount
    )
  }
  async function addLP(token: string, user: string, amount: number) {
    await lpKeeper.setCanAdd(wallet.address, true)
    await lpKeeper["add(string,bytes,string,bytes,uint256)"](
      EVM_CHAIN,
      token,
      EVM_CHAIN,
      user,
      amount
    )
  }
  async function subtractLP(token: string, user: string, amount: number) {
    await lpKeeper.setCanSubtract(wallet.address, true)
    await lpKeeper["subtract(string,bytes,string,bytes,uint256)"](
      EVM_CHAIN,
      token,
      EVM_CHAIN,
      user,
      amount
    )
  }
  async function farmForAWeek() {
    await farm.startFarming()
    farm.advanceTime(604800)
    await farm.unlockAsset()
  }

  it("constructor initializes variables", async () => {
    expect(await balanceAdder.owner()).to.eq(wallet.address)
    expect(await balanceAdder.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await balanceAdder.lpKeeper()).to.eq(lpKeeper.address)
    expect(await balanceAdder.farm()).to.eq(farm.address)
  })

  it("starting state after deployment", async () => {})

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(
        balanceAdder.connect(other).setOwner(wallet.address)
      ).to.be.revertedWith("ACW")
    })

    it("emits a SetOwner event", async () => {
      expect(await balanceAdder.setOwner(other.address))
        .to.emit(balanceAdder, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await balanceAdder.setOwner(other.address)
      expect(await balanceAdder.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await balanceAdder.setOwner(other.address)
      await expect(balanceAdder.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#setFarm", () => {
    it("fails if caller is not owner", async () => {
      await expect(
        balanceAdder.connect(other).setFarm(wallet.address)
      ).to.be.revertedWith("ACW")
    })

    it("updates farm address", async () => {
      await balanceAdder.setFarm(mockFarm.address)
      expect(await balanceAdder.farm()).to.eq(mockFarm.address)
    })

    it("emits event", async () => {
      await expect(balanceAdder.setFarm(mockFarm.address))
        .to.emit(balanceAdder, "SetFarm")
        .withArgs(farm.address, mockFarm.address)
    })
  })

  describe("#setImpact", () => {
    it("fails if caller is not parser", async () => {
      await expect(
        balanceAdder.setImpact(token1.address, 1000)
      ).to.be.revertedWith("ACR")
    })

    it("updates impact", async () => {
      await balanceAdder.setCanRoute(other.address, true)
      await balanceAdder.connect(other).setImpact(token1.address, 1000)
      expect(await balanceAdder.impact(token1.address)).to.eq(1000)
      expect(await balanceAdder.totalImpact()).to.eq(1000)
    })

    it("emits event", async () => {})
  })

  describe.only("#processBalances", () => {
    it("updates staking", async () => {
      await openWallet()
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        100
      )
      console.log((await balanceKeeper.totalBalance()).toString())
      console.log((await balanceAdder.totalBalance()).toString())
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper["add(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        100
      )

      await balanceAdder.setFarm(mockFarm.address)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(1)
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(1100)
    })

    it("updates staking and lp farming", async () => {
      await openWallet()
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await addLP(token1.address, wallet.address, 10)
      await balanceAdder.setFarm(mockFarm.address)
      await balanceAdder.setCanRoute(wallet.address, true)
      await balanceAdder.setImpact(token1.address, 1000)
      await balanceAdder.processBalances(1)
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(1000)
    })

    it("emits event", async () => {
      await openWallet()
      await openOther()
      await addLP(token1.address, wallet.address, 10)
      await addLP(token2.address, other.address, 10)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.setFarm(mockFarm.address)
      await balanceAdder.setCanRoute(wallet.address, true)
      await balanceAdder.setImpact(token1.address, 1000)
      await balanceAdder.setImpact(token2.address, 1000)
      await expect(balanceAdder.processBalances(3))
        .to.emit(balanceAdder, "ProcessBalances")
        .withArgs(mockFarm.address, 3)
        .to.emit(balanceAdder, "ProcessBalance")
        .withArgs(MAX_UINT, token1.address, mockFarm.address, 0, 0)
        .to.emit(balanceAdder, "ProcessBalance")
        .withArgs(MAX_UINT, token1.address, mockFarm.address, 1, 0)
        .to.emit(balanceAdder, "ProcessBalance")
        .withArgs(0, token1.address, mockFarm.address, 0, 500)
        .to.emit(balanceAdder, "ProcessBalance")
        .withArgs(1, token2.address, mockFarm.address, 1, 500)
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(500)
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, other.address)
      ).to.eq(500)
    })
  })
})
