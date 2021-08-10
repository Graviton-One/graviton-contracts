import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { MockOTC } from "../typechain/MockOTC"
import { otcFixture } from "./shared/fixtures"
import { expandTo18Decimals } from "./shared/utilities"

import { expect } from "./shared/expect"

describe("OTC", () => {
  const [wallet, other, another] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, another])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let otc: MockOTC

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, otc } = await loadFixture(otcFixture))
  })

  describe("#claim", () => {
    it("transfers gton at once", async () => {
        // buy 10 GTON for 50 USDC
        await token0.transfer(otc.address, expandTo18Decimals(10))
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        // claim after a year and a day
        await otc.advanceTime(86400)
        await otc.advanceTime(86400*365)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10))
    })

    it("transfers all gton in two claims of 6 months", async () => {
        // buy 10 GTON for 50 USDC
        await token0.transfer(otc.address, expandTo18Decimals(10))
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))

        // claim after half a year
        await otc.advanceTime((86400*7*4*6))
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(7).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(7).div(12))

        // claim after half a year
        await otc.advanceTime((86400*7*4*6))
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10))
    })

    it("transfers gton in 12 portions", async () => {
        // buy 10 GTON for 50 USDC
        await token0.transfer(otc.address, expandTo18Decimals(10))
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))

        // claim after a day
        await otc.advanceTime(86401)
        await otc.connect(other).claim()
        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(2))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(2))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(3).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(3).div(12))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(4).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(4).div(12))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(5).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(5).div(12))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(6).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(6).div(12))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(7).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(7).div(12))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(8).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(8).div(12))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(9).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(9).div(12))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(10).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(10).div(12))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(11).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(11).div(12))

        await otc.advanceTime(86400*365/12)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10))
    })
  })
})
