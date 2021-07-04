import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { SharesEB } from "../typechain/SharesEB"
import { ImpactEB } from "../typechain/ImpactEB"
import { BalanceKeeperV2 } from "../typechain/BalanceKeeperV2"
import { sharesEBFixture } from "./shared/fixtures"
import { makeValueImpact, EVM_CHAIN } from "./shared/utilities"

import { expect } from "./shared/expect"

describe("SharesEB", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let impactEB: ImpactEB
  let balanceKeeper: BalanceKeeperV2
  let sharesEB: SharesEB

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, impactEB, balanceKeeper, sharesEB } =
      await loadFixture(sharesEBFixture))
  })

  it("constructor initializes variables", async () => {
    expect(await sharesEB.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await sharesEB.impactEB()).to.eq(impactEB.address)
  })

  describe("#migrate", () => {
    it("processes no more users than step", async () => {
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, wallet.address, "1000", "0", "0")
        )
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, other.address, "2000", "1", "0")
        )
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, nebula.address, "2000", "2", "0")
        )
      await balanceKeeper.setCanOpen(sharesEB.address, true)
      await sharesEB.migrate(2)
      expect(await balanceKeeper.totalUsers()).to.eq(2)
    })

    it("processes no more than the the number of users", async () => {
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, wallet.address, "1000", "0", "0")
        )
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, other.address, "2000", "1", "0")
        )
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, nebula.address, "2000", "2", "0")
        )
      await balanceKeeper.setCanOpen(sharesEB.address, true)
      await sharesEB.migrate(4)
      expect(await balanceKeeper.totalUsers()).to.eq(3)
    })

    it("opens a new account if user is not known", async () => {
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, wallet.address, "1000", "0", "0")
        )
      await balanceKeeper.setCanOpen(sharesEB.address, true)
      await sharesEB.migrate(1)
      expect(await balanceKeeper.totalUsers()).to.eq(1)
    })

    it("copies impact from the old impact contract", async () => {
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, wallet.address, "1000", "0", "0")
        )
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, other.address, "2000", "1", "0")
        )
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, nebula.address, "2000", "2", "0")
        )
      await balanceKeeper.setCanOpen(sharesEB.address, true)
      await sharesEB.migrate(4)
      expect(await sharesEB.impactById(0)).to.eq(1000)
      expect(await sharesEB.impactById(1)).to.eq(2000)
      expect(await sharesEB.impactById(2)).to.eq(2000)
    })

    it("emits event", async () => {
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, wallet.address, "1000", "0", "0")
        )
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, other.address, "2000", "1", "0")
        )
      await balanceKeeper.setCanOpen(sharesEB.address, true)
      await expect(sharesEB.migrate(2))
        .to.emit(sharesEB, "Migrate")
        .withArgs(wallet.address, 0, 1000)
        .to.emit(sharesEB, "Migrate")
        .withArgs(other.address, 1, 2000)
    })
  })

  describe("#shareByid", () => {
    it("returns 0 if user is not known", async () => {
      expect(await sharesEB.shareById(0)).to.eq(0)
    })

    it("returns 0 if user has no impact", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      expect(await sharesEB.shareById(0)).to.eq(0)
    })

    it("returns user impact", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, wallet.address, "1000", "0", "0")
        )
      await sharesEB.migrate(1)
      expect(await sharesEB.shareById(0)).to.eq(1000)
    })
  })

  describe("#totalShares", () => {
    it("returns total impact", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.open(EVM_CHAIN, other.address)
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, wallet.address, "1000", "0", "0")
        )
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, other.address, "1000", "1", "0")
        )
      await sharesEB.migrate(2)
      expect(await sharesEB.totalShares()).to.eq(2000)
    })
  })

  describe("#totalUsers", () => {
    it("returns total impact", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.open(EVM_CHAIN, other.address)
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, wallet.address, "1000", "0", "0")
        )
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, other.address, "1000", "1", "0")
        )
      await sharesEB.migrate(2)
      expect(await sharesEB.totalUsers()).to.eq(2)
    })
  })

  describe("#userIdByIndex", () => {
    it("returns total impact", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.open(EVM_CHAIN, other.address)
      await impactEB
        .connect(nebula)
        .attachValue(
          makeValueImpact(token1.address, other.address, "1000", "1", "0")
        )
      await sharesEB.migrate(2)
      expect(await sharesEB.userIdByIndex(0)).to.eq(1)
    })
  })
})
