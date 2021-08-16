import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { TestUSDC } from "../typechain/TestUSDC"
import { MockOTC } from "../typechain/MockOTC"
import { otcFixture } from "./shared/fixtures"
import { expandTo18Decimals, START_TIME, MAX_UINT } from "./shared/utilities"

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
  let usdc: TestUSDC
  let otc: MockOTC
  let otcUSDC: MockOTC

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, usdc, otc, otcUSDC } = await loadFixture(otcFixture))
  })

  it("constructor initializes variables", async () => {
    expect(await otc.owner()).to.eq(wallet.address)
    expect(await otc.base()).to.eq(token0.address)
    expect(await otc.quote()).to.eq(token1.address)
    expect(await otc.price()).to.eq(500)
    expect(await otc.vested(wallet.address)).to.eq(0)
    expect(await otc.vested(other.address)).to.eq(0)
    expect(await otc.claimed(wallet.address)).to.eq(0)
    expect(await otc.claimed(other.address)).to.eq(0)
    expect(await otc.startTime(wallet.address)).to.eq(0)
    expect(await otc.startTime(other.address)).to.eq(0)
    expect(await otc.canSetPrice(wallet.address)).to.eq(true)
    expect(await otc.canSetPrice(other.address)).to.eq(false)
    expect(await otc.vestingTimeAdmin()).to.eq(86400*7*4*12)
    expect(await otc.numberOfTranchesAdmin()).to.eq(12)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(otc.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it("emits a SetOwner event", async () => {
      expect(await otc.setOwner(other.address))
        .to.emit(otc, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await otc.setOwner(other.address)
      expect(await otc.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await otc.setOwner(other.address)
      await expect(otc.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#setPrice", () => {
    it("fails if caller is not allowed to set price", async () => {
        await otc.advanceTime(86401)
        await expect(otc.connect(other).setPrice(500)).to.be.revertedWith("ACS")
    })

    it("fails if timestamp change since deployment is less than a day", async () => {
        await expect(otc.setPrice(600)).to.be.revertedWith("OTC1")
    })

    it("fails if timestamp change since last setPrice is less than a day", async () => {
        await otc.advanceTime(86401)
        await otc.setPrice(600)
        await otc.advanceTime(86399)
        await expect(otc.setPrice(700)).to.be.revertedWith("OTC1")
    })

    it("sets new price", async () => {
        await otc.advanceTime(86401)
        await otc.setPrice(600)
        expect(await otc.price()).to.eq(600)
    })

    it("sets new price again after a day", async () => {
        await otc.advanceTime(86401)
        await otc.setPrice(600)
        await otc.advanceTime(86401)
        await otc.setPrice(700)
        expect(await otc.price()).to.eq(700)
    })

    it("exchanges for a new price", async () => {
        await otc.advanceTime(86401)
        await otc.setPrice(600)
        await token0.transfer(otc.address, expandTo18Decimals(10))
        await token1.connect(other).approve(otc.address, expandTo18Decimals(60))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        expect(await token1.balanceOf(otc.address)).to.eq(expandTo18Decimals(60))
        expect(await otc.vested(other.address)).to.eq(expandTo18Decimals(10))
    })

    it("emits a SetPrice event", async () => {
        await otc.advanceTime(86401)
        await expect(otc.setPrice(600))
            .to.emit(otc, "SetPrice")
            .withArgs(600)
    })
  })

  describe("#setCanSetPrice", () => {
    it("fails if caller is not owner", async () => {
      await expect(
        otc.connect(other).setCanSetPrice(wallet.address, true)
      ).to.be.reverted
    })

    it("sets permission to true", async () => {
      await otc.setCanSetPrice(wallet.address, true)
      expect(await otc.canSetPrice(wallet.address)).to.eq(true)
    })

    it("sets permission to true idempotent", async () => {
      await otc.setCanSetPrice(wallet.address, true)
      await otc.setCanSetPrice(wallet.address, true)
      expect(await otc.canSetPrice(wallet.address)).to.eq(true)
    })

    it("sets permission to false", async () => {
      await otc.setCanSetPrice(wallet.address, true)
      await otc.setCanSetPrice(wallet.address, false)
      expect(await otc.canSetPrice(wallet.address)).to.eq(false)
    })

    it("sets permission to false idempotent", async () => {
      await otc.setCanSetPrice(wallet.address, false)
      await otc.setCanSetPrice(wallet.address, false)
      expect(await otc.canSetPrice(wallet.address)).to.eq(false)
    })

    it("emits event", async () => {
      await expect(otc.setCanSetPrice(other.address, true))
        .to.emit(otc, "SetCanSetPrice")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#setLimits", () => {
    it("fails if caller is not owner", async () => {
      await expect(otc.connect(other).setLimits(0, expandTo18Decimals(100)))
          .to.be.revertedWith("ACW")
    })

    it("fails if timestamp change since deployment is less than a day", async () => {
      await expect(otc.setLimits(0, expandTo18Decimals(100))).to.be.revertedWith("OTC2")
    })

    it("fails if timestamp change since last setLimits is less than a day", async () => {
        await otc.advanceTime(86401)
        await otc.setLimits(0, expandTo18Decimals(100))
        await otc.advanceTime(86399)
        await expect(otc.setLimits(0, expandTo18Decimals(100))).to.be.revertedWith("OTC2")
    })

    it("updates lower and upper limits for amount to exchange", async () => {
        await otc.advanceTime(86401)
        await otc.setLimits(50, expandTo18Decimals(50))
        expect(await otc.lowerLimit()).to.eq(50)
        expect(await otc.upperLimit()).to.eq(expandTo18Decimals(50))
    })

    it("emits a SetLimits event", async () => {
        await otc.advanceTime(86401)
        await expect(otc.setLimits(50, expandTo18Decimals(50)))
            .to.emit(otc, "SetLimits")
            .withArgs(50, expandTo18Decimals(50))
    })
  })

  describe("#setVestingParams", () => {
    it("fails if caller is not owner", async () => {
      await expect(otc.connect(other).setVestingParams(86400, 86400*7*4, 4))
          .to.be.revertedWith("ACW")
    })

    it("fails if timestamp change since deployment is less than a day", async () => {
      await expect(otc.setVestingParams(86400, 86400*7*4, 4)).to.be.revertedWith("OTC3")
    })

    it("fails if timestamp change since last setVestingParams is less than a day", async () => {
        await otc.advanceTime(86401)
        await otc.setVestingParams(86400, 86400*7*4, 4)
        await otc.advanceTime(86399)
        await expect(otc.setVestingParams(86400, 86400*7*4, 4)).to.be.revertedWith("OTC3")
    })

    it("updates lower and upper vestingParams for amount to exchange", async () => {
        await otc.advanceTime(86401)
        await otc.setVestingParams(86400, 86400*7*4, 4)
        expect(await otc.cliffAdmin()).to.eq(86400)
        expect(await otc.vestingTimeAdmin()).to.eq(86400*7*4)
        expect(await otc.numberOfTranchesAdmin()).to.eq(4)
    })

    it("applies new vesting params to otc exchange", async () => {
        await otc.advanceTime(86401)
        await otc.setVestingParams(86400, 86400*7*4, 4)

        await token0.transfer(otc.address, expandTo18Decimals(10))
        // other buys 10 GTON for 50 USDC
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))

        expect(await otc.vestingTime(other.address)).to.eq(86400*7*4)
        expect(await otc.numberOfTranches(other.address)).to.eq(4)
    })

    it("emits a SetVestingParams event", async () => {
        await otc.advanceTime(86401)
        await expect(otc.setVestingParams(86400, 86400*7*4, 4))
            .to.emit(otc, "SetVestingParams")
            .withArgs(86400, 86400*7*4, 4)
    })
  })

  describe("#exchange", () => {
    it("fails if account tries to exchange for the second time", async () => {
        await token0.transfer(otc.address, expandTo18Decimals(100))
        await token1.connect(other).approve(otc.address, expandTo18Decimals(100))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        await expect(otc.connect(other).exchange(expandTo18Decimals(10)))
            .to.be.revertedWith("OTC4")
    })

    it("fails if amount is less than undistributed balance", async () => {
        await token0.transfer(otc.address, expandTo18Decimals(10))
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(1))
        expect(await otc.vested(other.address)).to.eq(expandTo18Decimals(1))
        await token1.connect(another).approve(otc.address, expandTo18Decimals(50))
        await expect(otc.connect(another).exchange(expandTo18Decimals(10)))
            .to.be.revertedWith("OTC5")
    })

    it("fails if amount is smaller than lower limit", async () => {
        await token0.transfer(otc.address, expandTo18Decimals(99))
        await token1.connect(other).approve(otc.address, 99*5)
        await expect(otc.connect(other).exchange(99))
            .to.be.revertedWith("OTC6")
    })

    it("fails if amount is larger than upper limit", async () => {
        await token0.transfer(otc.address, expandTo18Decimals(101))
        await token1.connect(other).approve(otc.address, expandTo18Decimals(505))
        await expect(otc.connect(other).exchange(expandTo18Decimals(101)))
            .to.be.revertedWith("OTC6")
    })

    it("fails if no quote is paid", async () => {
        let liquidityGTON = "1000000000000000000";
        let liquidityUSDC = "5000000";

        // buy 10 GTON for 50 USDC
        await token0.transfer(otcUSDC.address, liquidityGTON)
        await usdc.Swapin(MAX_UINT, other.address, liquidityUSDC)
        await usdc.connect(other).approve(otcUSDC.address, liquidityUSDC)
        await expect(otcUSDC.connect(other).exchange(100))
            .to.be.revertedWith("OTC7")
    })

    it("transfers amount*price of quote tokens from caller,\
        increases caller's balance by amount, remembers startTime", async () => {
        // wallet deposits 10 GTON
        await token0.transfer(otc.address, expandTo18Decimals(10))
        // other buys 10 GTON for 50 USDC
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        expect(await token1.balanceOf(otc.address)).to.eq(expandTo18Decimals(50))
        expect(await otc.vested(other.address)).to.eq(expandTo18Decimals(10))
        expect(await otc.startTime(other.address)).to.eq(START_TIME)
    })

    it("emits Exchange event", async () => {
        await token0.transfer(otc.address, expandTo18Decimals(10))
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await expect(otc.connect(other).exchange(expandTo18Decimals(10)))
            .to.emit(otc, "Exchange")
            .withArgs(other.address, expandTo18Decimals(50), expandTo18Decimals(10))
    })
  })

  describe("#claim", () => {
    it("first claim fails if timestamp change since exchange is less than cliff", async () => {
        // wallet deposits 10 GTON
        await token0.transfer(otc.address, expandTo18Decimals(10))
        // other buys 10 GTON for 50 USDC
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        // other tries to claim after less than a day
        await otc.advanceTime(86399)
        await expect(otc.connect(other).claim()).to.be.revertedWith("OTC8")
    })

    it("second claim fails if timestamp change since last claim is less than CLAIM_PERIOD", async () => {
        // wallet deposits 10 GTON
        await token0.transfer(otc.address, expandTo18Decimals(10))
        // other buys 10 GTON for 50 USDC
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        // other claims after a day
        await otc.advanceTime(86401)
        await otc.connect(other).claim()
        // other tries to claim again after less than claim period
        await otc.advanceTime((86400*7*4)+1)
        await otc.connect(other).claim()

        await otc.advanceTime((86400*7*4))
        await expect(otc.connect(other).claim()).to.be.revertedWith("OTC9")
    })

    it("transfers BALANCE/NUMBER_CLAIMS base token to caller after cliff", async () => {
        // wallet deposits 10 GTON
        await token0.transfer(otc.address, expandTo18Decimals(10))
        // other buys 10 GTON for 50 USDC
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        // other claims after a day
        await otc.advanceTime(86401)
        await otc.connect(other).claim()
        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12))
    })

    it("transfers BALANCE/NUMBER_CLAIMS base token to caller after a month", async () => {
        // wallet deposits 10 GTON
        await token0.transfer(otc.address, expandTo18Decimals(10))
        // other buys 10 GTON for 50 USDC
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        // other claims after a month
        await otc.advanceTime(2419200)
        await otc.connect(other).claim()
        expect(await token0.balanceOf(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(2))
        expect(await otc.claimed(other.address)).to.eq(expandTo18Decimals(10).div(12).mul(2))
    })

    it("emits Claim event", async () => {
        // wallet deposits 10 GTON
        await token0.transfer(otc.address, expandTo18Decimals(10))
        // other buys 10 GTON for 50 USDC
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        // other claims after a month
        await otc.advanceTime(2419200)
        await expect(otc.connect(other).claim())
            .to.emit(otc, "Claim")
            .withArgs(other.address, expandTo18Decimals(10).div(12).mul(2))
    })
  })

  describe("#collect", () => {
    it("fails if caller is not owner", async () => {
      await expect(otc.connect(other).collect()).to.be.revertedWith("ACW")
    })

    it("transfers all quote tokens to the caller", async () => {
        // wallet has no USDC
        expect(await token1.balanceOf(wallet.address)).to.eq(expandTo18Decimals(0))
        // wallet deposits 10 GTON
        await token0.transfer(otc.address, expandTo18Decimals(10))
        // other buys 10 GTON for 50 USDC
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        // wallet collects all USDC
        await otc.collect()
        // wallet has 50 USDC
        expect(await token1.balanceOf(wallet.address)).to.eq(expandTo18Decimals(50))
    })

    it("emits Collect event", async () => {
        // wallet has no USDC
        expect(await token1.balanceOf(wallet.address)).to.eq(expandTo18Decimals(0))
        // wallet deposits 10 GTON
        await token0.transfer(otc.address, expandTo18Decimals(10))
        // other buys 10 GTON for 50 USDC
        await token1.connect(other).approve(otc.address, expandTo18Decimals(50))
        await otc.connect(other).exchange(expandTo18Decimals(10))
        // wallet collects all USDC
        await expect(otc.collect())
            .to.emit(otc, "Collect")
            .withArgs(expandTo18Decimals(50))
    })
  })
})
