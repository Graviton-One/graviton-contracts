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
  let otc4: MockOTC

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, otc } = await loadFixture(otcFixture))
  })

  describe("#claim 12 months, cliff 1 day", () => {
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
  describe("#claim 4 weeks, cliff 1 day", () => {
    beforeEach("deploy test contracts", async () => {

        let price = 500
        let lowerLimit = 100
        let upperLimit = expandTo18Decimals(100)
        let cliff = 86400
        let period = 86400*7*4
        let intervals = 4

        const otcFactory = await ethers.getContractFactory("MockOTC")
        otc4 = (await otcFactory.deploy(
          token0.address,
          token1.address,
          price,
          lowerLimit,
          upperLimit,
          cliff,
          period,
          intervals
        )) as MockOTC
    })

    it("transfers gton at once", async () => {

        // buy 10 GTON for 50 USDC
        await token0.transfer(otc4.address, expandTo18Decimals(10))
        await token1.connect(other).approve(otc4.address, expandTo18Decimals(50))
        await otc4.connect(other).exchange(expandTo18Decimals(10))
        // claim after a year and a day
        await otc4.advanceTime(86400)
        await otc4.advanceTime(86400*7*4)
        await otc4.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10))
        expect(await otc4.claimed(other.address)).to.eq(expandTo18Decimals(10))

    })

    it("transfers gton in 4 weeks", async () => {

        // buy 10 GTON for 50 USDC
        await token0.transfer(otc4.address, expandTo18Decimals(10))
        await token1.connect(other).approve(otc4.address, expandTo18Decimals(50))
        await otc4.connect(other).exchange(expandTo18Decimals(10))

        // claim after a day
        await otc4.advanceTime(86400+1)
        await otc4.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(1).div(4))
        expect(await otc4.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(1).div(4))

        // claim after a week
        await otc4.advanceTime(86400*7+1)
        await otc4.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(2).div(4))
        expect(await otc4.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(2).div(4))

        await otc4.advanceTime(86400*7+1)
        await otc4.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).mul(3).div(4))
        expect(await otc4.claimed(other.address)).to.eq(expandTo18Decimals(10).mul(3).div(4))

        await otc4.advanceTime(86400*7+1)
        await otc4.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10))
        expect(await otc4.claimed(other.address)).to.eq(expandTo18Decimals(10))

        await otc4.advanceTime(86400*7+1)
        await otc4.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10))
        expect(await otc4.claimed(other.address)).to.eq(expandTo18Decimals(10))
    })
  })

  describe("#claim 3 days, cliff 1 day", () => {
    it("transfers gton in 3 days", async () => {

        await otc.advanceTime(86400+1)
        let numberOfTranches = 3
        await otc.setVestingParams(86400, 86400*2, numberOfTranches)

        let liquidity = expandTo18Decimals(10);

        // buy 10 GTON for 50 USDC
        await token0.transfer(otc.address, liquidity)
        await token1.connect(other).approve(otc.address, liquidity.mul(5))
        await otc.connect(other).exchange(liquidity)

        // claim after a day
        await otc.advanceTime(86400+1)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address))
            .to.eq(liquidity.mul(2).div(numberOfTranches))
        expect(await otc.claimed(other.address))
            .to.eq(liquidity.mul(2).div(numberOfTranches))

        await otc.advanceTime(86400+1)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(liquidity)
        expect(await otc.claimed(other.address)).to.eq(liquidity)

        await otc.advanceTime(86400+1)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(liquidity)
        expect(await otc.claimed(other.address)).to.eq(liquidity)
    })
  })

  describe("#claim 3 hours, cliff 1 day", () => {
    it("transfers gton in 3 hours", async () => {

        await otc.advanceTime(86400+1)
        let numberOfTranches = 3
        await otc.setVestingParams(86400, 3600*3, numberOfTranches)

        let liquidity = expandTo18Decimals(10);

        // buy 10 GTON for 50 USDC
        await token0.transfer(otc.address, liquidity)
        await token1.connect(other).approve(otc.address, liquidity.mul(5))
        await otc.connect(other).exchange(liquidity)

        // claim after an hour
        await otc.advanceTime(3600+1)
        await expect(otc.connect(other).claim()).to.be.revertedWith("OTC4")

        // claim after a day
        await otc.advanceTime(86400+1)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(liquidity)
        expect(await otc.claimed(other.address)).to.eq(liquidity)

        await otc.advanceTime(86400+1)
        await otc.connect(other).claim()

        expect(await token0.balanceOf(other.address)).to.eq(liquidity)
        expect(await otc.claimed(other.address)).to.eq(liquidity)
    })
  })
})
