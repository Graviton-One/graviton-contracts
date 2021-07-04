import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { SharesLP } from "../typechain/SharesLP"
import { BalanceKeeperV2 } from "../typechain/BalanceKeeperV2"
import { LPKeeperV2 } from "../typechain/LPKeeperV2"
import { sharesLPFixture } from "./shared/fixtures"
import { EVM_CHAIN } from "./shared/utilities"

import { expect } from "./shared/expect"

describe("SharesLP", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let lpKeeper: LPKeeperV2
  let sharesLP: SharesLP

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, balanceKeeper, lpKeeper, sharesLP } =
      await loadFixture(sharesLPFixture))
  })

  it("constructor initializes variables", async () => {
    expect(await sharesLP.lpKeeper()).to.eq(lpKeeper.address)
    expect(await sharesLP.tokenId()).to.eq(0)
  })

  it("constructor fails if token is not known", async () => {
    const sharesLPFactory = await ethers.getContractFactory("SharesLP")
    await expect(sharesLPFactory.deploy(lpKeeper.address, 1)).to.be.reverted
  })

  describe("#shareByid", () => {
    it("returns 0 if user is not known", async () => {
      expect(await sharesLP.shareById(0)).to.eq(0)
    })

    it("returns 0 if token user is not known", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      expect(await sharesLP.shareById(0)).to.eq(0)
    })

    it("returns 0 if token user balance is 0", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 0, 100)
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper["subtract(uint256,uint256,uint256)"](0, 0, 100)
      expect(await sharesLP.shareById(0)).to.eq(0)
    })

    it("returns token user balance", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 0, 100)
      expect(await sharesLP.shareById(0)).to.eq(100)
    })
  })

  describe("#totalShares", () => {
    it("returns total token balance", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 0, 100)
      expect(await sharesLP.totalShares()).to.eq(100)
    })
  })

  describe("#totalUsers", () => {
    it("returns total token balance", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 0, 100)
      expect(await sharesLP.totalUsers()).to.eq(1)
    })
  })

  describe("#userIdByIndex", () => {
    it("returns total token balance", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.open(EVM_CHAIN, other.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 1, 100)
      expect(await sharesLP.userIdByIndex(0)).to.eq(1)
    })
  })
})
