import { ethers, waffle } from "hardhat"
import { MockTimeFarmCurved } from "../typechain/MockTimeFarmCurved"
import { expect } from "./shared/expect"
import { EARLY_BIRDS_A, EARLY_BIRDS_C } from "./shared/utilities"
import { TEST_START_TIME } from "./shared/fixtures"

const createFixtureLoader = waffle.createFixtureLoader

describe("FarmCurved", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let farm: MockTimeFarmCurved

  const fixture = async () => {
    const farmFactory = await ethers.getContractFactory("MockTimeFarmCurved")
    return (await farmFactory.deploy(
      EARLY_BIRDS_A,
      EARLY_BIRDS_C,
      0
    )) as MockTimeFarmCurved
  }

  let loadFixture: ReturnType<typeof createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = createFixtureLoader([wallet, other])
  })

  beforeEach("deploy farm", async () => {
    farm = await loadFixture(fixture)
  })

  it("constructor initializes variables", async () => {
    expect(await farm.owner()).to.eq(wallet.address)
    expect(await farm.a()).to.eq(EARLY_BIRDS_A)
    expect(await farm.c()).to.eq(EARLY_BIRDS_C)
  })

  it("starting state after deployment", async () => {
    expect(await farm.totalUnlocked()).to.eq(0)
    expect(await farm.lastTimestamp()).to.eq(0)
    expect(await farm.startTimestamp()).to.eq(0)
    expect(await farm.farmingStarted()).to.eq(false)
  })

  it("constructor starts farming if _startTimestamp is not 0", async () => {
    const farmFactory = await ethers.getContractFactory("MockTimeFarmCurved")
    farm = (await farmFactory.deploy(
      EARLY_BIRDS_A,
      EARLY_BIRDS_C,
      TEST_START_TIME
    )) as MockTimeFarmCurved
    expect(await farm.startTimestamp()).to.eq(TEST_START_TIME)
    expect(await farm.lastTimestamp()).to.eq(TEST_START_TIME)
    expect(await farm.farmingStarted()).to.eq(true)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(farm.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it("emits a SetOwner event", async () => {
      expect(await farm.setOwner(other.address))
        .to.emit(farm, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await farm.setOwner(other.address)
      expect(await farm.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await farm.setOwner(other.address)
      await expect(farm.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#stopFarming", () => {
    it("fails if caller is not owner", async () => {
      await expect(farm.connect(other).stopFarming()).to.be.reverted
    })

    it("updates deprecated", async () => {
      expect(await farm.farmingStopped()).to.eq(false)
      await farm.stopFarming()
      expect(await farm.farmingStopped()).to.eq(true)
    })
  })

  describe("#startFarming", () => {
    it("fails if caller is not owner", async () => {
      await expect(farm.connect(other).startFarming()).to.be.reverted
    })

    it("sets starting timestamp", async () => {
      await farm.startFarming()
      farm.advanceTime(1)
      await expect(await farm.startTimestamp()).to.be.eq(TEST_START_TIME)
    })

    it("fails last claimed timestamp", async () => {
      await farm.startFarming()
      farm.advanceTime(1)
      await expect(await farm.lastTimestamp()).to.be.eq(TEST_START_TIME)
    })
  })

  describe("#unlockAsset", () => {
    it("cannot be called before initialization", async () => {
      await expect(farm.unlockAsset()).to.be.reverted
    })

    it("cannot be called after the contract is deprecated", async () => {
      await farm.startFarming()
      farm.advanceTime(1)
      await farm.stopFarming()
      await expect(farm.unlockAsset()).to.be.reverted
    })

    it("unlocks after one week", async () => {
      await farm.startFarming()
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await expect(await farm.totalUnlocked()).to.be.eq(
        "96044673105003010055905"
      )
    })

    it("unlocks after one week", async () => {
      await farm.startFarming()
      farm.advanceTime(604800)
      await farm.unlockAsset()
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await expect(await farm.totalUnlocked()).to.be.eq(
        "183688261375906802671116"
      )
    })

    it("unlocks after two weeks", async () => {
      await farm.startFarming()
      farm.advanceTime(1209600)
      await farm.unlockAsset()
      await expect(await farm.totalUnlocked()).to.be.eq(
        "183688261375906802671116"
      )
    })

    it("unlocks after four weeks", async () => {
      await farm.startFarming()
      farm.advanceTime(2419200)
      await farm.unlockAsset()
      await expect(await farm.totalUnlocked()).to.be.eq(
        "337826626283123222944472"
      )
    })

    it("unlocks after six months", async () => {
      await farm.startFarming()
      farm.advanceTime(14515200)
      await farm.unlockAsset()
      await expect(await farm.totalUnlocked()).to.be.eq(
        "1123374512487256187667572"
      )
    })

    it("unlocks after a year", async () => {
      await farm.startFarming()
      farm.advanceTime(31536000)
      await farm.unlockAsset()
      await expect(await farm.totalUnlocked()).to.be.eq(
        "1499842209403393520254556"
      )
    })
  })
})
