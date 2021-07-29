import { ethers, waffle } from "hardhat"
import { BigNumber } from "ethers"
import { TestERC20 } from "../typechain/TestERC20"
import { WrappedNative } from "../typechain/WrappedNative"
import { UniswapV2Pair } from "../typechain/UniswapV2Pair"
import { UniswapV2Factory } from "../typechain/UniswapV2Factory"
import { UniswapV2Router01 } from "../typechain/UniswapV2Router01"
import { RelayLock } from "../typechain/RelayLock"
import { relayLockFixture } from "./shared/fixtures"
import { expect } from "./shared/expect"
import { expandTo18Decimals, FTM_CHAIN } from "./shared/utilities"

describe("RelayLock", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let weth: WrappedNative
  let uniswapV2Pair: UniswapV2Pair
  let uniswapV2Factory: UniswapV2Factory
  let uniswapV2Router01: UniswapV2Router01
  let relayLock: RelayLock

  beforeEach("deploy test contracts", async () => {
    ;({ token0,
        token1,
        token2,
        weth,
        uniswapV2Factory,
        uniswapV2Router01,
        uniswapV2Pair,
        relayLock
      } = await loadFixture(relayLockFixture))
  })

  it("constructor initializes variables", async () => {
      expect(await relayLock.owner()).to.eq(wallet.address)
      expect(await relayLock.wnative()).to.eq(weth.address)
      expect(await relayLock.router()).to.eq(uniswapV2Router01.address)
      expect(await relayLock.gton()).to.eq(token0.address)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(relayLock.connect(other).setOwner(wallet.address)).to.be
        .reverted
    })

    it("emits a SetOwner event", async () => {
      expect(await relayLock.setOwner(other.address))
        .to.emit(relayLock, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await relayLock.setOwner(other.address)
      expect(await relayLock.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await relayLock.setOwner(other.address)
      await expect(relayLock.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#lock", () => {
    it("fails if amount out is equal to fees", async () => {
      await relayLock.setFees(FTM_CHAIN, "10000", 100)
      await expect(relayLock.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
        .to.be.reverted
    })

    it("fails if amount out is less then fees", async () => {
      await relayLock.setFees(FTM_CHAIN, "10001", 100)
      await expect(relayLock.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
        .to.be.reverted
    })

    it("swaps native tokens for gton", async () => {
      await expect(relayLock.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
            .to.emit(relayLock, "CalculateFee")
            .withArgs(
              "10000",
              "9969",
              "0",
              "0",
              "0",
              "9969"
            )
            .to.emit(relayLock, "Lock")
            .withArgs(
                ethers.utils.solidityKeccak256(["string"], [FTM_CHAIN]),
                ethers.utils.solidityKeccak256(["bytes"], [wallet.address]),
                FTM_CHAIN,
                wallet.address.toLowerCase(),
                "9969"
            )
      expect(await token0.balanceOf(relayLock.address)).to.eq("9969")
    })

    it("subtracts minimum fee when it's larger than percentage", async () => {
      await relayLock.setFees(FTM_CHAIN, "1000", 1000)
      await expect(relayLock.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
            .to.emit(relayLock, "CalculateFee")
            .withArgs(
              "10000",
              "9969",
              "1000",
              "1000",
              "99",
              "8969"
            )
    })

    it("subtracts percentage fee when it's larger than minimum", async () => {
      await relayLock.setFees(FTM_CHAIN, "100", 2000)
      await expect(relayLock.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
            .to.emit(relayLock, "CalculateFee")
            .withArgs(
              "10000",
              "9969",
              "100",
              "2000",
              "199",
              "9770"
            )
    })

    it("emits event", async () => {
        await relayLock.setFees(FTM_CHAIN, "100", 2000)
        await expect(relayLock.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
            .to.emit(relayLock, "CalculateFee")
            .withArgs(
              "10000",
              "9969",
              "100",
              "2000",
              "199",
              "9770"
            )
    })

    it("emits event", async () => {
        await expect(relayLock.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
            .to.emit(relayLock, "Lock")
            .withArgs(
                ethers.utils.solidityKeccak256(["string"], [FTM_CHAIN]),
                ethers.utils.solidityKeccak256(["bytes"], [wallet.address]),
                FTM_CHAIN,
                wallet.address.toLowerCase(),
                "9969"
            )
    })
  })

  describe("#reclaimERC20", () => {
    it("fails if caller is not owner", async () => {
      await expect(relayLock.connect(other).reclaimERC20(token0.address))
          .to.be.reverted
    })

    it("transfers ERC20 tokens to caller", async () => {
        let balance = await token0.balanceOf(wallet.address)
        await token0.transfer(other.address, balance.sub(10))
        await token0.transfer(relayLock.address, 10)
        expect(await token0.balanceOf(wallet.address)).to.eq(0)
        expect(await token0.balanceOf(relayLock.address)).to.eq(10)
        await relayLock.reclaimERC20(token0.address)
        expect(await token0.balanceOf(relayLock.address)).to.eq(0)
        expect(await token0.balanceOf(wallet.address)).to.eq(10)
    })
  })

  describe("#reclaimNative", () => {
    it("fails if caller is not owner", async () => {
      await expect(relayLock.connect(other).reclaimNative(token0.address))
          .to.be.reverted
    })

    it("transfers native tokens to caller", async () => {
        await relayLock.lock(FTM_CHAIN, wallet.address, {value: expandTo18Decimals(10)})
        expect(await wallet.provider.getBalance(relayLock.address)).to.eq(0)
        await relayLock.reclaimNative(0)
        expect(await wallet.provider.getBalance(relayLock.address)).to.eq(0)
    })
  })
})
