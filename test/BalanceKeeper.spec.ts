import { ethers, waffle } from "hardhat"
import { BalanceKeeper } from "../typechain/BalanceKeeper"
import { expect } from "./shared/expect"

describe("BalanceKeeper", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let balanceKeeper: BalanceKeeper

  const fixture = async () => {
    const balanceKeeperFactory = await ethers.getContractFactory(
      "BalanceKeeper"
    )
    return (await balanceKeeperFactory.deploy()) as BalanceKeeper
  }

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  beforeEach("deploy test contracts", async () => {
    balanceKeeper = await loadFixture(fixture)
  })

  it("constructor initializes variables", async () => {
    expect(await balanceKeeper.owner()).to.eq(wallet.address)
  })

  it("starting state after deployment", async () => {
    await expect(balanceKeeper.users(0)).to.be.reverted
    expect(await balanceKeeper.totalBalance()).to.eq(0)
    expect(await balanceKeeper.userBalance(wallet.address)).to.eq(0)
    expect(await balanceKeeper.userBalance(other.address)).to.eq(0)
    expect(await balanceKeeper.canAdd(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canAdd(other.address)).to.eq(false)
    expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canSubtract(other.address)).to.eq(false)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(balanceKeeper.connect(other).setOwner(wallet.address)).to.be
        .reverted
    })

    it("emits a SetOwner event", async () => {
      expect(await balanceKeeper.setOwner(other.address))
        .to.emit(balanceKeeper, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await balanceKeeper.setOwner(other.address)
      expect(await balanceKeeper.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await balanceKeeper.setOwner(other.address)
      await expect(balanceKeeper.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#totalUsers", () => {
    it("returns the number of users", async () => {
      expect(await balanceKeeper.totalUsers()).to.eq(0)
    })
  })

  describe("#setCanAdd", () => {
    it("fails if caller is not owner", async () => {
      await expect(balanceKeeper.connect(other).setCanAdd(wallet.address, true))
        .to.be.reverted
    })

    it("sets permission to true", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      expect(await balanceKeeper.canAdd(wallet.address)).to.eq(true)
    })

    it("sets permission to true idempotent", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.setCanAdd(wallet.address, true)
      expect(await balanceKeeper.canAdd(wallet.address)).to.eq(true)
    })

    it("sets permission to false", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.setCanAdd(wallet.address, false)
      expect(await balanceKeeper.canAdd(wallet.address)).to.eq(false)
    })

    it("sets permission to false idempotent", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.setCanAdd(wallet.address, false)
      await balanceKeeper.setCanAdd(wallet.address, false)
      expect(await balanceKeeper.canAdd(wallet.address)).to.eq(false)
    })

    it("emits event", async () => {
      await expect(balanceKeeper.setCanAdd(other.address, true))
        .to.emit(balanceKeeper, "SetCanAdd")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#setCanSubtract", () => {
    it("fails if caller is not owner", async () => {
      await expect(
        balanceKeeper.connect(other).setCanSubtract(wallet.address, true)
      ).to.be.reverted
    })

    it("sets permission to true", async () => {
      await balanceKeeper.setCanSubtract(wallet.address, true)
      expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(true)
    })

    it("sets permission to true idempotent", async () => {
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(true)
    })

    it("sets permission to false", async () => {
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.setCanSubtract(wallet.address, false)
      expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(false)
    })

    it("sets permission to false idempotent", async () => {
      await balanceKeeper.setCanSubtract(wallet.address, false)
      await balanceKeeper.setCanSubtract(wallet.address, false)
      expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(false)
    })

    it("emits event", async () => {
      await expect(balanceKeeper.setCanSubtract(other.address, true))
        .to.emit(balanceKeeper, "SetCanSubtract")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#add", () => {
    it("fails if caller is not allowed to add", async () => {
      await expect(balanceKeeper.add(other.address, 1)).to.be.reverted
    })

    it("records a new user", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(other.address, 1)
      expect(await balanceKeeper.isKnownUser(other.address)).to.eq(true)
      expect(await balanceKeeper.users(0)).to.eq(other.address)
    })

    it("does not record a known user", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(other.address, 1)
      await balanceKeeper.add(other.address, 1)
      await expect(balanceKeeper.users(1)).to.be.reverted
    })

    it("adds to user balance", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 1)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(1)
    })

    it("adds to total balance", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 1)
      expect(await balanceKeeper.totalBalance()).to.eq(1)
    })

    it("adds each value to total balance", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 1)
      await balanceKeeper.add(other.address, 1)
      expect(await balanceKeeper.totalBalance()).to.eq(2)
    })

    it("emits event", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await expect(balanceKeeper.add(other.address, 1))
        .to.emit(balanceKeeper, "Add")
        .withArgs(wallet.address, other.address, 1)
    })
  })

  describe("#subtract", () => {
    it("fails if caller is not allowed to subtract", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(other.address, 1)
      await expect(balanceKeeper.subtract(other.address, 1)).to.be.reverted
    })

    it("fails if there is nothing to subtract", async () => {
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await expect(balanceKeeper.subtract(other.address, 1)).to.be.reverted
    })

    it("subtracts from user balance", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(other.address, 2)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.subtract(other.address, 1)
      expect(await balanceKeeper.userBalance(other.address)).to.eq(1)
    })

    it("subtracts from total balance", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(other.address, 2)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.subtract(other.address, 1)
      expect(await balanceKeeper.totalBalance()).to.eq(1)
    })

    it("emits event", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(other.address, 2)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await expect(balanceKeeper.subtract(other.address, 1))
        .to.emit(balanceKeeper, "Subtract")
        .withArgs(wallet.address, other.address, 1)
    })
  })
})
