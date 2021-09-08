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
import { BalanceAdderV2 } from "../typechain/BalanceAdderV2"
import { balanceAdderV2Fixture } from "./shared/fixtures"
import { EVM_CHAIN, makeValueImpact } from "./shared/utilities"

describe("BalanceAdderV2", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let farmStaking: MockTimeFarmLinear
  let impactEB: ImpactEB
  let sharesEB: SharesEB
  let farmEB: MockTimeFarmCurved
  let lpKeeper: LPKeeperV2
  let sharesLP1: SharesLP
  let farmLP1: MockTimeFarmLinear
  let sharesLP2: SharesLP
  let farmLP2: MockTimeFarmLinear
  let balanceAdder: BalanceAdderV2
  let mockFarm1: Contract
  let mockShares1: Contract
  let mockFarm2: Contract
  let mockShares2: Contract

  beforeEach("deploy test contracts", async () => {
    ;({
      token0,
      token1,
      token2,
      balanceKeeper,
      farmStaking,
      impactEB,
      sharesEB,
      farmEB,
      lpKeeper,
      sharesLP1,
      farmLP1,
      sharesLP2,
      farmLP2,
      balanceAdder,
    } = await loadFixture(balanceAdderV2Fixture))

    // mock contracts so first processBalances gives 100 to each
    // mock farm always has 1000 unlocked
    const farmABI = ["function totalUnlocked() view returns (uint256)"]
    mockFarm1 = await waffle.deployMockContract(wallet, farmABI)
    await mockFarm1.mock.totalUnlocked.returns(1000)
    mockFarm2 = await waffle.deployMockContract(wallet, farmABI)
    await mockFarm2.mock.totalUnlocked.returns(1000)
    // mock shares is always 1/10
    const sharesABI = [
      "function shareById(uint256) view returns (uint256)",
      "function totalShares() view returns (uint256)",
      "function totalUsers() view returns (uint256)",
      "function userIdByIndex(uint256) view returns (uint256)",
    ]
    mockShares1 = await waffle.deployMockContract(wallet, sharesABI)
    await mockShares1.mock.shareById.returns(1)
    await mockShares1.mock.totalShares.returns(10)
    await mockShares1.mock.totalUsers.returns(2)
    await mockShares1.mock.userIdByIndex.withArgs(0).returns(0)
    await mockShares1.mock.userIdByIndex.withArgs(1).returns(1)
    mockShares2 = await waffle.deployMockContract(wallet, sharesABI)
    await mockShares2.mock.shareById.returns(1)
    await mockShares2.mock.totalShares.returns(10)
    await mockShares2.mock.totalUsers.returns(2)
    await mockShares2.mock.userIdByIndex.withArgs(0).returns(0)
    await mockShares2.mock.userIdByIndex.withArgs(1).returns(1)
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
  async function addEB(user: string, amount: string) {
    await impactEB
      .connect(nebula)
      .attachValue(
        makeValueImpact(
          token1.address,
          user,
          amount,
          Math.floor(Math.random() * 1000).toString(),
          "0"
        )
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
  async function farmEBForAWeek() {
    await farmEB.startFarming()
    farmEB.advanceTime(604800)
    await farmEB.unlockAsset()
  }
  async function farmLP1ForAWeek() {
    await farmLP1.startFarming()
    farmLP1.advanceTime(604800)
    await farmLP1.unlockAsset()
  }
  async function farmStakingForAWeek() {
    await farmStaking.startFarming()
    farmStaking.advanceTime(604800)
    await farmStaking.unlockAsset()
  }

  it("constructor initializes variables", async () => {
    expect(await balanceAdder.owner()).to.eq(wallet.address)
    expect(await balanceAdder.balanceKeeper()).to.eq(balanceKeeper.address)
  })

  it("starting state after deployment", async () => {
    expect(await balanceAdder.totalUnlocked()).to.eq(0)
    expect(await balanceAdder.currentUser()).to.eq(0)
    expect(await balanceAdder.totalUsers()).to.eq(0)
    expect(await balanceAdder.currentPortion()).to.eq(0)
    expect(await balanceAdder.currentFarm()).to.eq(0)
    await expect(balanceAdder.lastPortions(0)).to.be.reverted
    await expect(balanceAdder.farms(0)).to.be.reverted
    await expect(balanceAdder.shares(0)).to.be.reverted
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(balanceAdder.connect(other).setOwner(wallet.address)).to.be
        .reverted
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

  describe("#totalFarms", () => {
    it("returns the number of farms", async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      expect(await balanceAdder.totalFarms()).to.eq(1)
    })
  })

  describe("#addFarm", () => {
    it("fails if caller is not owner", async () => {
      await expect(
        balanceAdder
          .connect(other)
          .addFarm(mockShares1.address, mockFarm1.address, 0)
      ).to.be.reverted
    })

    it("appends shares", async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      expect(await balanceAdder.shares(0)).to.eq(mockShares1.address)
    })

    it("appends farms", async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      expect(await balanceAdder.farms(0)).to.eq(mockFarm1.address)
    })

    it("appends last portions", async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      expect(await balanceAdder.lastPortions(0)).to.eq(0)
    })

    it("emits event", async () => {
      await expect(
        balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      )
        .to.emit(balanceAdder, "AddFarm")
        .withArgs(1, mockShares1.address, mockFarm1.address, 0)
    })
  })

  describe("#removeFarm", () => {
    it("fails if caller is not owner", async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await expect(balanceAdder.connect(other).removeFarm(0)).to.be.reverted
    })

    it("fails if the farm is currently processing balances", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(1)
      await expect(balanceAdder.removeFarm(0)).to.be.revertedWith("BA1")
    })

    it("removes shares", async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      expect(await balanceAdder.shares(0)).to.eq(mockShares1.address)
      await balanceAdder.removeFarm(0)
      await expect(balanceAdder.shares(0)).to.be.reverted
    })

    it("removes shares", async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      expect(await balanceAdder.shares(0)).to.eq(mockShares1.address)
      await balanceAdder.addFarm(mockShares2.address, mockFarm2.address, 0)
      await balanceAdder.removeFarm(0)
      expect(await balanceAdder.shares(0)).to.eq(mockShares2.address)
    })

    it("removes farms", async () => {
      await balanceAdder.addFarm(mockFarm1.address, mockFarm1.address, 0)
      expect(await balanceAdder.farms(0)).to.eq(mockFarm1.address)
      await balanceAdder.removeFarm(0)
      await expect(balanceAdder.farms(0)).to.be.reverted
    })

    it("removes farms", async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      expect(await balanceAdder.farms(0)).to.eq(mockFarm1.address)
      await balanceAdder.addFarm(mockShares2.address, mockFarm2.address, 0)
      await balanceAdder.removeFarm(0)
      expect(await balanceAdder.farms(0)).to.eq(mockFarm2.address)
    })

    it("removes last portions", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      expect(await balanceAdder.lastPortions(0)).to.eq(0)
      await balanceAdder.addFarm(mockShares2.address, mockFarm2.address, 0)
      expect(await balanceAdder.lastPortions(1)).to.eq(0)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await balanceAdder.lastPortions(0)).to.eq("1000")
      expect(await balanceAdder.lastPortions(1)).to.eq(0)
      await balanceAdder.removeFarm(0)
      expect(await balanceAdder.lastPortions(0)).to.eq(0)
      await expect(balanceAdder.lastPortions(1)).to.be.reverted
    })

    it.only("removes last portions", async () => {
      await openWallet()
      await openOther()
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      // change farm unlock on every run to imitate multiple different farms
      await mockFarm1.mock.totalUnlocked.returns(100)
      await balanceAdder.processBalances(2)
      await mockFarm1.mock.totalUnlocked.returns(101)
      await balanceAdder.processBalances(2)
      await mockFarm1.mock.totalUnlocked.returns(102)
      await balanceAdder.processBalances(2)
      await mockFarm1.mock.totalUnlocked.returns(103)
      await balanceAdder.processBalances(2)
      await mockFarm1.mock.totalUnlocked.returns(104)
      await balanceAdder.processBalances(2)
      await mockFarm1.mock.totalUnlocked.returns(105)
      await balanceAdder.processBalances(2)
      expect(await balanceAdder.lastPortions(0)).to.eq("100")
      expect(await balanceAdder.lastPortions(1)).to.eq("101")
      expect(await balanceAdder.lastPortions(2)).to.eq("102")
      expect(await balanceAdder.lastPortions(3)).to.eq("103")
      expect(await balanceAdder.lastPortions(4)).to.eq("104")
      expect(await balanceAdder.lastPortions(5)).to.eq("105")
      await balanceAdder.removeFarm(3)
      expect(await balanceAdder.lastPortions(0)).to.eq("100")
      expect(await balanceAdder.lastPortions(1)).to.eq("101")
      expect(await balanceAdder.lastPortions(2)).to.eq("102")
      expect(await balanceAdder.lastPortions(3)).to.eq("104")
      expect(await balanceAdder.lastPortions(4)).to.eq("105")
      await balanceAdder.removeFarm(1)
      expect(await balanceAdder.lastPortions(0)).to.eq("100")
      expect(await balanceAdder.lastPortions(1)).to.eq("102")
      expect(await balanceAdder.lastPortions(2)).to.eq("104")
      expect(await balanceAdder.lastPortions(3)).to.eq("105")
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await mockFarm1.mock.totalUnlocked.returns(100)
      await balanceAdder.processBalances(2)
      await mockFarm1.mock.totalUnlocked.returns(102)
      await balanceAdder.processBalances(2)
      await mockFarm1.mock.totalUnlocked.returns(104)
      await balanceAdder.processBalances(2)
      await mockFarm1.mock.totalUnlocked.returns(105)
      await balanceAdder.processBalances(2)
      await mockFarm1.mock.totalUnlocked.returns(106)
      await balanceAdder.processBalances(2)
      expect(await balanceAdder.lastPortions(0)).to.eq("100")
      expect(await balanceAdder.lastPortions(1)).to.eq("102")
      expect(await balanceAdder.lastPortions(2)).to.eq("104")
      expect(await balanceAdder.lastPortions(3)).to.eq("105")
      expect(await balanceAdder.lastPortions(4)).to.eq("106")
    })

    it("removes farms", async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      expect(await balanceAdder.farms(0)).to.eq(mockFarm1.address)
      await balanceAdder.addFarm(mockShares2.address, mockFarm2.address, 0)
      await expect(balanceAdder.removeFarm(0))
        .to.emit(balanceAdder, "RemoveFarm")
        .withArgs(0, mockShares1.address, mockFarm1.address, 0)
    })
  })

  describe("#processBalances", () => {
    it("returns without effects if there are no active farms", async () => {
      await openWallet()
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(0)
      await balanceAdder.processBalances(1)
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(0)
    })

    it("fails if not allowed to add value", async () => {
      await openWallet()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await expect(balanceAdder.processBalances(1)).to.be.reverted
    })

    it("updates total users at the start of each loop", async () => {
      await openWallet()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await mockShares1.mock.totalUsers.returns(1)
      await balanceAdder.processBalances(1)
      expect(await balanceAdder.totalUsers()).to.eq(1)
      await openOther()
      await mockShares1.mock.totalUsers.returns(2)
      await balanceAdder.processBalances(1)
      expect(await balanceAdder.totalUsers()).to.eq(2)
    })

    it("updates total unlocked at the start of each loop", async () => {
      await openWallet()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(1)
      expect(await balanceAdder.totalUnlocked()).to.eq(1000)
    })

    it("updates current portion at the start of each loop", async () => {
      await openWallet()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(1)
      expect(await balanceAdder.currentPortion()).to.eq(1000)
    })

    it("updates last user when step is less than total users", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(1)
      expect(await balanceAdder.currentUser()).to.eq(1)
      await balanceAdder.processBalances(1)
      expect(await balanceAdder.currentUser()).to.eq(0)
    })

    it("does not change last user if step is zero", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(0)
      expect(await balanceAdder.currentUser()).to.eq(0)
      await balanceAdder.processBalances(1)
      expect(await balanceAdder.currentUser()).to.eq(1)
      await balanceAdder.processBalances(0)
      expect(await balanceAdder.currentUser()).to.eq(1)
    })

    it("sets last user to zero when step is equal to total users", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await balanceAdder.currentUser()).to.eq(0)
    })

    it("sets last user to zero when step is larger than total users", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(3)
      expect(await balanceAdder.currentUser()).to.eq(0)
    })

    it("emits event", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address, 0)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await expect(balanceAdder.processBalances(3))
        .to.emit(balanceAdder, "ProcessBalances")
        .withArgs(0, mockShares1.address, mockFarm1.address, 3)
        .to.emit(balanceAdder, "ProcessBalance")
        .withArgs(0, mockShares1.address, mockFarm1.address, 0, 100)
        .to.emit(balanceAdder, "ProcessBalance")
        .withArgs(0, mockShares1.address, mockFarm1.address, 1, 100)
      expect(await balanceAdder.currentUser()).to.eq(0)
    })

    describe("#EB", () => {
      it("does not add values if the shares contract is empty", async () => {
        await openWallet()
        await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await expect(balanceAdder.processBalances(1)).to.not.emit(
          balanceAdder,
          "ProcessBalance"
        )
      })

      it("does not add values if farm is not started", async () => {
        await openWallet()
        await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
        await addEB(wallet.address, "100")
        await sharesEB.migrate(1)
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(1)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(0)
      })

      it("does not add values if step is zero", async () => {
        await openWallet()
        await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
        await addEB(wallet.address, "100")
        await sharesEB.migrate(1)
        await farmEBForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(0)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(0)
      })

      it("adds value to only one user if step is 1", async () => {
        await openWallet()
        await openOther()
        await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
        await addEB(wallet.address, "100")
        await sharesEB.migrate(1)
        await farmEBForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(1)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(
          "96044673105003010055905"
        )
        expect(await balanceKeeper["balance(uint256)"](1)).to.eq(0)
      })

      it("adds value to users", async () => {
        await openWallet()
        await openOther()
        await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
        await addEB(wallet.address, "100")
        await addEB(other.address, "100")
        await sharesEB.migrate(2)
        await farmEBForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(2)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(
          "48022336552501505027952"
        )
        expect(await balanceKeeper["balance(uint256)"](1)).to.eq(
          "48022336552501505027952"
        )
      })

      it("updates last portion", async () => {
        await openWallet()
        await openOther()
        await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
        await addEB(wallet.address, "100")
        await sharesEB.migrate(1)
        await farmEBForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(2)
        expect(await balanceAdder.lastPortions(0)).to.eq(
          "96044673105003010055905"
        )
      })
    })

    describe("#LP", () => {
      it("does not add values if the shares contract is empty", async () => {
        await openWallet()
        await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await expect(balanceAdder.processBalances(1)).to.not.emit(
          balanceAdder,
          "ProcessBalance"
        )
      })

      it("does not add values if farm is not started", async () => {
        await openWallet()
        await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
        await addLP(token1.address, wallet.address, 10)
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(1)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(0)
      })

      it("does not add values if step is zero", async () => {
        await openWallet()
        await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
        await addLP(token1.address, wallet.address, 10)
        await farmLP1ForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(0)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(0)
      })

      it("adds value to only one user if step is 1", async () => {
        await openWallet()
        await openOther()
        await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
        await addLP(token1.address, wallet.address, 10)
        await farmLP1ForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(1)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(
          "7000000000000000000000"
        )
        expect(await balanceKeeper["balance(uint256)"](1)).to.eq(0)
      })

      it("adds value to users", async () => {
        await openWallet()
        await openOther()
        await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
        await addLP(token1.address, wallet.address, 10)
        await addLP(token1.address, other.address, 10)
        await farmLP1ForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(2)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(
          "3500000000000000000000"
        )
        expect(await balanceKeeper["balance(uint256)"](1)).to.eq(
          "3500000000000000000000"
        )
      })

      it("updates last portion", async () => {
        await openWallet()
        await openOther()
        await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
        await addLP(token1.address, wallet.address, 10)
        await farmLP1ForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(2)
        expect(await balanceAdder.lastPortions(0)).to.eq(
          "7000000000000000000000"
        )
      })
    })

    describe("#Staking", () => {
      it("fails if the shares contract is empty", async () => {
        await openWallet()
        await balanceAdder.addFarm(
          balanceKeeper.address,
          farmStaking.address,
          0
        )
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await expect(balanceAdder.processBalances(1)).to.not.emit(
          balanceAdder,
          "ProcessBalance"
        )
      })

      it("does not add values if farm is not started", async () => {
        await openWallet()
        await balanceAdder.addFarm(
          balanceKeeper.address,
          farmStaking.address,
          0
        )
        await add(wallet.address, 10)
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(1)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(10)
      })

      it("does not add values if step is zero", async () => {
        await openWallet()
        await balanceAdder.addFarm(
          balanceKeeper.address,
          farmStaking.address,
          0
        )
        await add(wallet.address, 10)
        await farmStakingForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(0)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(10)
      })

      it.only("adds value to only one user if step is 1", async () => {
        await openWallet()
        await openOther()
        await balanceAdder.addFarm(
          balanceKeeper.address,
          farmStaking.address,
          0
        )
        await add(wallet.address, 10)
        console.log(await balanceKeeper["balance(uint256)"](0))
        await farmStakingForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(1)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(
          "7000000000000000000010"
        )
        expect(await balanceKeeper["balance(uint256)"](1)).to.eq(0)
      })

      it("adds value to users", async () => {
        await openWallet()
        await openOther()
        await balanceAdder.addFarm(
          balanceKeeper.address,
          farmStaking.address,
          0
        )
        await add(wallet.address, 10)
        await add(other.address, 10)
        await farmStakingForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(2)
        expect(await balanceKeeper["balance(uint256)"](0)).to.eq(
          "3500000000000000000010"
        )
        expect(await balanceKeeper["balance(uint256)"](1)).to.eq(
          "3500000000000000000010"
        )
      })

      it("updates last portion", async () => {
        await openWallet()
        await openOther()
        await balanceAdder.addFarm(
          balanceKeeper.address,
          farmStaking.address,
          0
        )
        await add(wallet.address, 10)
        await farmStakingForAWeek()
        await balanceKeeper.setCanAdd(balanceAdder.address, true)
        await balanceAdder.processBalances(2)
        expect(await balanceAdder.lastPortions(0)).to.eq(
          "7000000000000000000000"
        )
      })
    })
  })
})
