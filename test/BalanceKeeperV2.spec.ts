import { ethers, waffle } from "hardhat"
import { BalanceKeeperV2 } from "../typechain/BalanceKeeperV2"
import { expect } from "./shared/expect"
import { EVM_CHAIN } from "./shared/utilities"

describe("BalanceKeeperV2", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let balanceKeeper: BalanceKeeperV2

  const fixture = async () => {
    const balanceKeeperFactory = await ethers.getContractFactory(
      "BalanceKeeperV2"
    )
    return (await balanceKeeperFactory.deploy()) as BalanceKeeperV2
  }

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  beforeEach("deploy test contracts", async () => {
    balanceKeeper = await loadFixture(fixture)
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

  it("constructor initializes variables", async () => {
    expect(await balanceKeeper.owner()).to.eq(wallet.address)
  })

  it("starting state after deployment", async () => {
    expect(await balanceKeeper.canAdd(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canAdd(other.address)).to.eq(false)
    expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canSubtract(other.address)).to.eq(false)
    expect(await balanceKeeper.canOpen(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canOpen(other.address)).to.eq(false)
    expect(await balanceKeeper.totalUsers()).to.eq(0)
    expect(await balanceKeeper.totalBalance()).to.eq(0)
    expect(await balanceKeeper["balance(uint256)"](0)).to.eq(0)
    expect(await balanceKeeper["balance(uint256)"](1)).to.eq(0)
    expect(
      await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
    ).to.eq(0)
    expect(
      await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, other.address)
    ).to.eq(0)
    await expect(balanceKeeper.userIdByChainAddress(EVM_CHAIN, wallet.address))
      .to.be.reverted
    await expect(balanceKeeper.userIdByChainAddress(EVM_CHAIN, other.address))
      .to.be.reverted
    await expect(balanceKeeper.userChainById(0)).to.be.reverted
    await expect(balanceKeeper.userAddressById(0)).to.be.reverted
    await expect(balanceKeeper.userChainAddressById(0)).to.be.reverted
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

  describe("#setCanOpen", () => {
    it("fails if caller is not owner", async () => {
      await expect(
        balanceKeeper.connect(other).setCanOpen(wallet.address, true)
      ).to.be.reverted
    })

    it("sets permission to true", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      expect(await balanceKeeper.canOpen(wallet.address)).to.eq(true)
    })

    it("sets permission to true idempotent", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.setCanOpen(wallet.address, true)
      expect(await balanceKeeper.canOpen(wallet.address)).to.eq(true)
    })

    it("sets permission to false", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.setCanOpen(wallet.address, false)
      expect(await balanceKeeper.canOpen(wallet.address)).to.eq(false)
    })

    it("sets permission to false idempotent", async () => {
      await balanceKeeper.setCanOpen(wallet.address, false)
      await balanceKeeper.setCanOpen(wallet.address, false)
      expect(await balanceKeeper.canOpen(wallet.address)).to.eq(false)
    })

    it("emits event", async () => {
      await expect(balanceKeeper.setCanOpen(other.address, true))
        .to.emit(balanceKeeper, "SetCanOpen")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#userChainById", () => {
    it("fails for the user that is not known", async () => {
      await expect(balanceKeeper.userChainById(0)).to.be.reverted
    })

    it("returns chain for the known user", async () => {
      await openWallet()
      expect(await balanceKeeper.userChainById(0)).to.eq(EVM_CHAIN)
    })
  })

  describe("#userAddressById", () => {
    it("fails for the user that is not known", async () => {
      await expect(balanceKeeper.userAddressById(0)).to.be.reverted
    })

    it("returns address for the known user", async () => {
      await openWallet()
      expect(await balanceKeeper.userAddressById(0)).to.eq(
        wallet.address.toLowerCase()
      )
    })
  })

  describe("#userChainAddressById", () => {
    it("fails for the user that is not known", async () => {
      await expect(balanceKeeper.userChainById(0)).to.be.reverted
    })

    it("returns chain and address for the known user", async () => {
      await openWallet()
      let chainAddress = await balanceKeeper.userChainAddressById(0)
      expect(chainAddress[0]).to.eq(EVM_CHAIN)
      expect(chainAddress[1]).to.eq(wallet.address.toLowerCase())
    })
  })

  describe("#userIdByChainAddress", () => {
    it("fails for the user that is not known", async () => {
      await expect(
        balanceKeeper.userIdByChainAddress(EVM_CHAIN, wallet.address)
      ).to.be.reverted
    })

    it("returns id for the known user", async () => {
      await openWallet()
      expect(
        await balanceKeeper.userIdByChainAddress(EVM_CHAIN, wallet.address)
      ).to.eq(0)
    })
  })

  describe("#isKnownUser(uint256)", () => {
    it("returns false for the user that is not known", async () => {
      expect(await balanceKeeper["isKnownUser(uint256)"](0)).to.eq(false)
    })

    it("returns true for the known user", async () => {
      await openWallet()
      expect(await balanceKeeper["isKnownUser(uint256)"](0)).to.eq(true)
    })
  })

  describe("#isKnownUser(string,bytes)", () => {
    it("returns false for the user that is not known", async () => {
      expect(
        await balanceKeeper["isKnownUser(string,bytes)"](
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(false)
    })

    it("returns true for the known user", async () => {
      await openWallet()
      expect(
        await balanceKeeper["isKnownUser(string,bytes)"](
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(true)
    })
  })

  describe("#balance", () => {
    it("returns 0 for the user that is not known", async () => {
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(0)
    })

    it("returns 0 for the user that is not known when 0 user has balance", async () => {
      await openWallet()
      await add(wallet.address, 100)
      expect(await balanceKeeper["balance(uint256)"](1)).to.eq(0)
    })

    it("returns 0 when the balance is empty", async () => {
      await openWallet()
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(0)
    })

    it("returns balance for the known user", async () => {
      await openWallet()
      await add(wallet.address, 100)
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(100)
    })
  })

  describe("#balance", () => {
    it("returns 0 for the user that is not known", async () => {
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(0)
    })

    it("returns 0 for the user that is not known when 0 user has balance", async () => {
      await openWallet()
      await add(wallet.address, 100)
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, other.address)
      ).to.eq(0)
    })

    it("returns 0 when the balance is empty", async () => {
      await openWallet()
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(0)
    })

    it("returns balance for the known user", async () => {
      await openWallet()
      await add(wallet.address, 100)
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(100)
    })
  })

  describe("#open", () => {
    it("fails if caller is not allowed to open", async () => {
      await expect(balanceKeeper.open(EVM_CHAIN, wallet.address)).to.be.reverted
    })

    it("sets chain for id", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      expect(await balanceKeeper.userChainById(0)).to.eq(EVM_CHAIN)
    })

    it("sets address for id", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      expect(await balanceKeeper.userAddressById(0)).to.eq(
        wallet.address.toLowerCase()
      )
    })

    it("sets id for chain and address", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      let chainAddress = await balanceKeeper.userChainAddressById(0)
      expect(chainAddress[0]).to.eq(EVM_CHAIN)
      expect(chainAddress[1]).to.eq(wallet.address.toLowerCase())
    })

    it("increments the number of users for the chain and address that are not known", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      expect(await balanceKeeper.totalUsers()).to.eq(1)
    })

    it("increments the number of users for the chain and address that are not known", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.open(EVM_CHAIN, other.address)
      expect(await balanceKeeper.totalUsers()).to.eq(2)
    })

    it("does not increment the number of users for the known chain and address", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      expect(await balanceKeeper.totalUsers()).to.eq(1)
    })

    it("does not increment the number of users for the same address in upper and lower case", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.open(EVM_CHAIN, wallet.address.toLowerCase())
      expect(await balanceKeeper.totalUsers()).to.eq(1)
    })

    it("emits event", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await expect(balanceKeeper.open(EVM_CHAIN, wallet.address))
        .to.emit(balanceKeeper, "Open")
        .withArgs(wallet.address, 0)
      await expect(balanceKeeper.open(EVM_CHAIN, other.address))
        .to.emit(balanceKeeper, "Open")
        .withArgs(wallet.address, 1)
    })
  })

  describe("#add(uint256,uint256)", () => {
    it("fails if caller is not allowed to add", async () => {
      await openWallet()
      await expect(balanceKeeper["add(uint256,uint256)"](0, 1)).to.be.reverted
    })

    it("fails if the id is not known", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await expect(balanceKeeper["add(uint256,uint256)"](0, 1)).to.be.reverted
    })

    it("adds amount to user balance", async () => {
      await openWallet()
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(uint256,uint256)"](0, 100)
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(100)
    })

    it("adds amount to total balance", async () => {
      await openWallet()
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(uint256,uint256)"](0, 100)
      expect(await balanceKeeper.totalBalance()).to.eq(100)
    })

    it("adds amount to total balance", async () => {
      await openWallet()
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(uint256,uint256)"](0, 100)
      await balanceKeeper.open(EVM_CHAIN, other.address)
      await balanceKeeper["add(uint256,uint256)"](1, 100)
      expect(await balanceKeeper.totalBalance()).to.eq(200)
    })
  })

  describe("#add(string,bytes,uint256)", () => {
    it("fails if caller is not allowed to add", async () => {
      await openWallet()
      await expect(
        balanceKeeper["add(string,bytes,uint256)"](
          EVM_CHAIN,
          wallet.address,
          100
        )
      ).to.be.reverted
    })

    it("fails if the chain and address are not known", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await expect(
        balanceKeeper["add(string,bytes,uint256)"](
          EVM_CHAIN,
          wallet.address,
          100
        )
      ).to.be.reverted
    })

    it("adds amount to user balance", async () => {
      await openWallet()
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        100
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(100)
    })

    it("adds amount to total balance", async () => {
      await openWallet()
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        100
      )
      expect(await balanceKeeper.totalBalance()).to.eq(100)
    })

    it("adds amount to total balance", async () => {
      await openWallet()
      await openOther()
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        100
      )
      await balanceKeeper["add(string,bytes,uint256)"](
        EVM_CHAIN,
        other.address,
        100
      )
      expect(await balanceKeeper.totalBalance()).to.eq(200)
    })
  })

  describe("#subtract(uint256,uint256)", () => {
    it("fails if caller is not allowed to subtract", async () => {
      await openWallet()
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(uint256,uint256)"](0, 100)
      await expect(balanceKeeper["subtract(uint256,uint256)"](0, 50)).to.be
        .reverted
    })

    it("fails if the id is not known", async () => {
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await expect(balanceKeeper["subtract(uint256,uint256)"](0, 0)).to.be
        .reverted
    })

    it("subtracts amount from user balance", async () => {
      await openWallet()
      await add(wallet.address, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper["subtract(uint256,uint256)"](0, 50)
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(50)
    })

    it("subtracts amount from total balance", async () => {
      await openWallet()
      await add(wallet.address, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper["subtract(uint256,uint256)"](0, 50)
      expect(await balanceKeeper.totalBalance()).to.eq(50)
    })

    it("subtracts amount from total balance", async () => {
      await openWallet()
      await add(wallet.address, 100)
      await openOther()
      await add(other.address, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper["subtract(uint256,uint256)"](0, 50)
      await balanceKeeper["subtract(uint256,uint256)"](1, 75)
      expect(await balanceKeeper.totalBalance()).to.eq(75)
    })
  })

  describe("#subtract(string,bytes,uint256)", () => {
    it("fails if caller is not allowed to subtract", async () => {
      await openWallet()
      await add(wallet.address, 100)
      await expect(
        balanceKeeper["subtract(string,bytes,uint256)"](
          EVM_CHAIN,
          wallet.address,
          100
        )
      ).to.be.reverted
    })

    it("fails if the chain and address are not known", async () => {
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await expect(
        balanceKeeper["subtract(string,bytes,uint256)"](
          EVM_CHAIN,
          wallet.address,
          0
        )
      ).to.be.reverted
    })

    it("subtracts amount from user", async () => {
      await openWallet()
      await add(wallet.address, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper["subtract(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        50
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.eq(50)
    })

    it("subtracts amount from total balance", async () => {
      await openWallet()
      await add(wallet.address, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper["subtract(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        50
      )
      expect(await balanceKeeper.totalBalance()).to.eq(50)
    })

    it("subtracts amount from total balance", async () => {
      await openWallet()
      await add(wallet.address, 100)
      await openOther()
      await add(other.address, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper["subtract(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        50
      )
      await balanceKeeper["subtract(string,bytes,uint256)"](
        EVM_CHAIN,
        other.address,
        75
      )
      expect(await balanceKeeper.totalBalance()).to.eq(75)
    })
  })

  describe("#shareById", () => {
    it("returns user balance", async () => {
      await openWallet()
      await add(wallet.address, 100)
      expect(await balanceKeeper.shareById(0)).to.eq(100)
    })
  })

  describe("#totalShares", () => {
    it("returns total balance", async () => {
      await openWallet()
      await add(wallet.address, 100)
      await openOther()
      await add(other.address, 100)
      expect(await balanceKeeper.totalShares()).to.eq(200)
    })
  })
})
