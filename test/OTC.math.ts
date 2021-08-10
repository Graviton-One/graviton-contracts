import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { MockOTC } from "../typechain/MockOTC"
import { otcFixture } from "./shared/fixtures"
import { expandTo18Decimals } from "./shared/utilities"

import { expect } from "./shared/expect"

describe("OTC", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let otc: MockOTC

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, otc } = await loadFixture(otcFixture))
  })

  describe("#claim", () => {

    it("transfers gton in 12 portions", async () => {
        // buy 10 GTON for 50 USDC
        token1.transfer(other.address, expandTo18Decimals(50))
        token0.transfer(otc.address, expandTo18Decimals(10))
        otc.connect(other).exchange(expandTo18Decimals(10))
        // claim after a day
        otc.advanceTime(86400)
        otc.connect(other).claim()
        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(2))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(2))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(3))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(3))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(4))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(4))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(5))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(5))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(6))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(6))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(7))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(7))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(8))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(8))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(9))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(9))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(10))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(10))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(11))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(11))

        otc.advanceTime(86400*365/12)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10))

    })
    it("transfers all gton at once", async () => {
        // buy 10 GTON for 50 USDC
        token1.transfer(other.address, expandTo18Decimals(50))
        token0.transfer(otc.address, expandTo18Decimals(10))
        otc.connect(other).exchange(expandTo18Decimals(10))
        // claim after a year and a day
        otc.advanceTime(86400)
        otc.advanceTime(86400*365)
        otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10))
    })
  })
})
