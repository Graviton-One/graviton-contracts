import { ethers, waffle } from "hardhat"
import { ImpactEB } from "../typechain/ImpactEB"
import { TestERC20 } from "../typechain/TestERC20"
import { impactEBFixture } from "./shared/fixtures"
import { makeValueImpact } from "./shared/utilities"

import { expect } from "./shared/expect"

describe("ImpactEB", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let impactEB: ImpactEB

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, impactEB } = await loadFixture(impactEBFixture))
  })

  it("starting state after deployment", async () => {
    expect(await impactEB.impact(wallet.address)).to.eq(0)
    expect(await impactEB.impact(other.address)).to.eq(0)
  })

  describe("#attachValue", () => {
    it("fails if caller is not nebula", async () => {
      let attachValue = makeValueImpact(
        token1.address,
        wallet.address,
        "1000",
        "0",
        "0"
      )
      await expect(impactEB.attachValue(attachValue)).to.be.reverted
    })

    it("does not emit event if attach is not allowed", async () => {
      await impactEB.toggleAttach(false)
      let attachValue = makeValueImpact(
        token1.address,
        wallet.address,
        "1000",
        "0",
        "0"
      )
      await expect(
        impactEB.connect(nebula).attachValue(attachValue)
      ).to.not.emit(impactEB, "Transfer")
    })

    it("does not emit event if id has already been processed", async () => {
      let attachValue = makeValueImpact(
        token1.address,
        wallet.address,
        "1000",
        "0",
        "0"
      )
      await impactEB.connect(nebula).attachValue(attachValue)
      await expect(
        impactEB.connect(nebula).attachValue(attachValue)
      ).to.not.emit(impactEB, "Transfer")
    })

    it("emits event", async () => {
      let attachValue = makeValueImpact(
        token1.address,
        wallet.address,
        "1000",
        "0",
        "0"
      )
      await expect(impactEB.connect(nebula).attachValue(attachValue))
        .to.emit(impactEB, "Transfer")
        .withArgs(token1.address, wallet.address, 1000, 0, 0)
    })

    it("does not register data if token is not allowed", async () => {
      let attachValue = makeValueImpact(
        token0.address,
        wallet.address,
        "1000",
        "0",
        "0"
      )
      await impactEB.connect(nebula).attachValue(attachValue)
      expect(await impactEB.userCount()).to.eq(0)
      expect(await impactEB.impact(wallet.address)).to.eq(0)
      expect(await impactEB.totalSupply()).to.eq(0)
    })

    it("increments the number of users if the user is new", async () => {
      let attachValue = makeValueImpact(
        token1.address,
        wallet.address,
        "1000",
        "0",
        "0"
      )
      await impactEB.connect(nebula).attachValue(attachValue)
      expect(await impactEB.userCount()).to.eq(1)
    })

    it("does not increment the number of users if the user is known", async () => {
      let attachValue1 = makeValueImpact(
        token1.address,
        wallet.address,
        "1000",
        "0",
        "0"
      )
      await impactEB.connect(nebula).attachValue(attachValue1)
      let attachValue2 = makeValueImpact(
        token1.address,
        wallet.address,
        "1000",
        "1",
        "0"
      )
      await impactEB.connect(nebula).attachValue(attachValue2)
      expect(await impactEB.userCount()).to.eq(1)
    })

    it("adds impact", async () => {
      let attachValue = makeValueImpact(
        token1.address,
        wallet.address,
        "1000",
        "0",
        "0"
      )
      await impactEB.connect(nebula).attachValue(attachValue)
      expect(await impactEB.impact(wallet.address)).to.eq(1000)
    })

    it("adds total supply", async () => {
      let attachValue = makeValueImpact(
        token1.address,
        wallet.address,
        "1000",
        "0",
        "0"
      )
      await impactEB.connect(nebula).attachValue(attachValue)
      expect(await impactEB.totalSupply()).to.eq(1000)
    })
  })
})
