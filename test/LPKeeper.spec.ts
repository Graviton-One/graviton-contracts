import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { MockTimeFarmCurved } from "../typechain/MockTimeFarmCurved"
import { LPKeeper } from "../typechain/LPKeeper"
import { lpKeeperFixture } from "./shared/fixtures"
import { expect } from "./shared/expect"

describe("LPKeeper", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let lpKeeper: LPKeeper

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, lpKeeper } = await loadFixture(lpKeeperFixture))
  })

  it("constructor initializes variables", async () => {
    expect(await lpKeeper.owner()).to.eq(wallet.address)
  })

  it("starting state after deployment", async () => {
    await expect(lpKeeper.lpTokens(0)).to.be.reverted
    expect(await lpKeeper.isKnownLPToken(token1.address)).to.eq(false)
    expect(await lpKeeper.isKnownLPToken(token2.address)).to.eq(false)
    expect(await lpKeeper.totalBalance(token1.address)).to.eq(0)
    expect(await lpKeeper.totalBalance(token2.address)).to.eq(0)
    await expect(lpKeeper.users(token1.address, 0)).to.be.reverted
    await expect(lpKeeper.users(token2.address, 0)).to.be.reverted
    expect(await lpKeeper.isKnownUser(token1.address, wallet.address)).to.eq(
      false
    )
    expect(await lpKeeper.isKnownUser(token1.address, other.address)).to.eq(
      false
    )
    expect(await lpKeeper.isKnownUser(token2.address, wallet.address)).to.eq(
      false
    )
    expect(await lpKeeper.isKnownUser(token2.address, other.address)).to.eq(
      false
    )
    expect(await lpKeeper.userBalance(token1.address, wallet.address)).to.eq(0)
    expect(await lpKeeper.userBalance(token1.address, other.address)).to.eq(0)
    expect(await lpKeeper.userBalance(token2.address, wallet.address)).to.eq(0)
    expect(await lpKeeper.userBalance(token2.address, other.address)).to.eq(0)
    expect(await lpKeeper.canAdd(wallet.address)).to.eq(false)
    expect(await lpKeeper.canAdd(other.address)).to.eq(false)
    expect(await lpKeeper.canSubtract(wallet.address)).to.eq(false)
    expect(await lpKeeper.canSubtract(other.address)).to.eq(false)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(lpKeeper.connect(other).setOwner(wallet.address)).to.be
        .reverted
    })

    it("emits a SetOwner event", async () => {
      expect(await lpKeeper.setOwner(other.address))
        .to.emit(lpKeeper, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await lpKeeper.setOwner(other.address)
      expect(await lpKeeper.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await lpKeeper.setOwner(other.address)
      await expect(lpKeeper.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#setCanAdd", () => {
    it("fails if caller is not owner", async () => {
      await expect(lpKeeper.connect(other).setCanAdd(wallet.address, true)).to
        .be.reverted
    })

    it("sets permission to true", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(true)
    })

    it("sets permission to true idempotent", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, true)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(true)
    })

    it("sets permission to false", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, false)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(false)
    })

    it("sets permission to false idempotent", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, false)
      await lpKeeper.setCanAdd(wallet.address, false)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(false)
    })

    it("emits event", async () => {
      await expect(lpKeeper.setCanAdd(other.address, true))
        .to.emit(lpKeeper, "SetCanAdd")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#setCanSubtract", () => {
    it("fails if caller is not owner", async () => {
      await expect(lpKeeper.connect(other).setCanSubtract(wallet.address, true))
        .to.be.reverted
    })

    it("sets permission to true", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(true)
    })

    it("sets permission to true idempotent", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper.setCanSubtract(wallet.address, true)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(true)
    })

    it("sets permission to false", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper.setCanSubtract(wallet.address, false)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(false)
    })

    it("sets permission to false idempotent", async () => {
      await lpKeeper.setCanSubtract(wallet.address, false)
      await lpKeeper.setCanSubtract(wallet.address, false)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(false)
    })

    it("emits event", async () => {
      await expect(lpKeeper.setCanSubtract(other.address, true))
        .to.emit(lpKeeper, "SetCanSubtract")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#add", () => {
    it("fails if caller is not allowed to add", async () => {
      await expect(lpKeeper.add(token1.address, other.address, 1)).to.be
        .reverted
    })

    it("records a new user", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, other.address, 1)
      expect(await lpKeeper.isKnownUser(token1.address, other.address)).to.eq(
        true
      )
      expect(await lpKeeper.users(token1.address, 0)).to.eq(other.address)
      expect(await lpKeeper.totalUsers(token1.address)).to.eq(1)
    })

    it("does not record a known user", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, other.address, 1)
      await lpKeeper.add(token1.address, other.address, 1)
      await expect(lpKeeper.users(token1.address, 1)).to.be.reverted
      expect(await lpKeeper.totalUsers(token1.address)).to.eq(1)
    })

    it("adds to user balance", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, wallet.address, 1)
      expect(await lpKeeper.userBalance(token1.address, wallet.address)).to.eq(
        1
      )
    })

    it("adds to total balance", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, wallet.address, 1)
      expect(await lpKeeper.totalBalance(token1.address)).to.eq(1)
    })

    it("adds each value to total balance", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, wallet.address, 1)
      await lpKeeper.add(token1.address, other.address, 1)
      expect(await lpKeeper.totalBalance(token1.address)).to.eq(2)
    })

    it("emits event", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await expect(lpKeeper.add(token1.address, other.address, 1))
        .to.emit(lpKeeper, "Add")
        .withArgs(wallet.address, token1.address, other.address, 1)
    })
  })

  describe("#subtract", () => {
    it("fails if caller is not allowed to subtract", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, other.address, 1)
      await expect(lpKeeper.subtract(token1.address, other.address, 1)).to.be
        .reverted
    })

    it("fails if there is nothing to subtract", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(lpKeeper.subtract(token1.address, other.address, 1)).to.be
        .reverted
    })

    it("subtracts from user balance", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, other.address, 2)
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper.subtract(token1.address, other.address, 1)
      expect(await lpKeeper.userBalance(token1.address, other.address)).to.eq(1)
    })

    it("subtracts from total balance", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, other.address, 2)
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper.subtract(token1.address, other.address, 1)
      expect(await lpKeeper.totalBalance(token1.address)).to.eq(1)
    })

    it("emits event", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, other.address, 2)
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(lpKeeper.subtract(token1.address, other.address, 1))
        .to.emit(lpKeeper, "Subtract")
        .withArgs(wallet.address, token1.address, other.address, 1)
    })
  })

  describe("#totalLPTokens", () => {
    it("returns the number of LP tokens", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, wallet.address, 1)
      expect(await lpKeeper.totalLPTokens()).to.eq(1)
    })

    it("returns the number of LP tokens", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, wallet.address, 1)
      await lpKeeper.add(token2.address, wallet.address, 1)
      expect(await lpKeeper.totalLPTokens()).to.eq(2)
    })
  })

  describe("#totalUsers", () => {
    it("returns the number of users for an LP token", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, wallet.address, 1)
      expect(await lpKeeper.totalUsers(token1.address)).to.eq(1)
    })

    it("returns the number of users for an LP token", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, wallet.address, 1)
      await lpKeeper.add(token1.address, other.address, 1)
      expect(await lpKeeper.totalUsers(token1.address)).to.eq(2)
    })
  })
})
