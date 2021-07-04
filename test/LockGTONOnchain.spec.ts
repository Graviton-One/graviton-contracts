import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { LockGTONOnchain } from "../typechain/LockGTONOnchain"
import { BalanceKeeperV2 } from "../typechain/BalanceKeeperV2"
import { lockGTONOnchainFixture } from "./shared/fixtures"

import { expect } from "./shared/expect"

describe("LockGTONOnchain", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let lockGTON: LockGTONOnchain

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, balanceKeeper, lockGTON } = await loadFixture(
      lockGTONOnchainFixture
    ))
  })

  it("constructor initializes variables", async () => {
    expect(await lockGTON.owner()).to.eq(wallet.address)
    expect(await lockGTON.governanceToken()).to.eq(token0.address)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(lockGTON.connect(other).setOwner(wallet.address)).to.be
        .reverted
    })

    it("emits a SetOwner event", async () => {
      expect(await lockGTON.setOwner(other.address))
        .to.emit(lockGTON, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await lockGTON.setOwner(other.address)
      expect(await lockGTON.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await lockGTON.setOwner(other.address)
      await expect(lockGTON.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#setCanLock", () => {
    it("fails if caller is not owner", async () => {
      await expect(lockGTON.connect(other).setCanLock(true)).to.be.reverted
    })

    it("updates withdraw permission", async () => {
      await lockGTON.setCanLock(true)
      expect(await lockGTON.connect(other).canLock()).to.eq(true)
    })

    it("emits event", async () => {
      await expect(lockGTON.setCanLock(true))
        .to.emit(lockGTON, "SetCanLock")
        .withArgs(wallet.address, true)
    })
  })

  describe("#lock", () => {
    it("fails if lock is not allowed", async () => {
      await expect(lockGTON.lock(1)).to.be.reverted
    })

    it("fails if not allowed to open users", async () => {
      await token0.approve(lockGTON.address, 1)
      await lockGTON.setCanLock(true)
      await balanceKeeper.setCanAdd(lockGTON.address, true)
      await expect(lockGTON.lock(1)).to.be.reverted
    })

    it("fails if not allowed to add tokens", async () => {
      await token0.approve(lockGTON.address, 1)
      await lockGTON.setCanLock(true)
      await balanceKeeper.setCanOpen(lockGTON.address, true)
      await expect(lockGTON.lock(1)).to.be.reverted
    })

    it("opens user", async () => {
      expect(await token0.balanceOf(lockGTON.address)).to.eq(0)
      await token0.approve(lockGTON.address, 1)
      await lockGTON.setCanLock(true)
      await balanceKeeper.setCanOpen(lockGTON.address, true)
      await balanceKeeper.setCanAdd(lockGTON.address, true)
      await lockGTON.lock(1)
      expect(await token0.balanceOf(lockGTON.address)).to.eq(1)
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(1)
    })

    it("locks tokens", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open("EVM", wallet.address)
      expect(await token0.balanceOf(lockGTON.address)).to.eq(0)
      await token0.approve(lockGTON.address, 1)
      await lockGTON.setCanLock(true)
      await balanceKeeper.setCanAdd(lockGTON.address, true)
      await lockGTON.lock(1)
      expect(await token0.balanceOf(lockGTON.address)).to.eq(1)
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(1)
    })

    it("emits event", async () => {
      await token0.approve(lockGTON.address, 1)
      await lockGTON.setCanLock(true)
      await balanceKeeper.setCanOpen(lockGTON.address, true)
      await balanceKeeper.setCanAdd(lockGTON.address, true)
      expect(lockGTON.lock(1))
        .to.emit(lockGTON, "LockGTON")
        .withArgs(token0.address, wallet.address, wallet.address, 1)
    })
  })

  describe("#migrate", () => {
    it("fails if caller is not owner", async () => {
      await expect(lockGTON.connect(other).migrate(wallet.address)).to.be
        .reverted
    })

    it("migrates locked tokens", async () => {
      expect(await token0.balanceOf(other.address)).to.eq(0)
      await token0.approve(lockGTON.address, 1)
      await lockGTON.setCanLock(true)
      await balanceKeeper.setCanOpen(lockGTON.address, true)
      await balanceKeeper.setCanAdd(lockGTON.address, true)
      await lockGTON.lock(1)
      await lockGTON.migrate(other.address)
      expect(await token0.balanceOf(other.address)).to.eq(1)
    })

    it("emits event", async () => {
      expect(await token0.balanceOf(other.address)).to.eq(0)
      await token0.approve(lockGTON.address, 1)
      await lockGTON.setCanLock(true)
      await balanceKeeper.setCanOpen(lockGTON.address, true)
      await balanceKeeper.setCanAdd(lockGTON.address, true)
      await lockGTON.lock(1)
      await expect(lockGTON.migrate(other.address))
        .to.emit(lockGTON, "Migrate")
        .withArgs(other.address, 1)
    })
  })
})
