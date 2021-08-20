import { ethers, waffle } from "hardhat"
import { BigNumber } from "ethers"
import { TestERC20 } from "../typechain/TestERC20"
import { WrappedNative } from "../typechain/WrappedNative"
import { UniswapV2Pair } from "../typechain/UniswapV2Pair"
import { UniswapV2Factory } from "../typechain/UniswapV2Factory"
import { UniswapV2Router01 } from "../typechain/UniswapV2Router01"
import { Relay } from "../typechain/Relay"
import { RelayParser } from "../typechain/RelayParser"
import { relayFixture } from "./shared/fixtures"
import { expect } from "./shared/expect"
import {
  FTM_CHAIN,
  BNB_CHAIN,
  PLG_CHAIN,
  SOL_CHAIN,
  expandTo18Decimals,
  RELAY_TOPIC,
  MOCK_UUID,
  MAX_UINT
} from "./shared/utilities"

describe("Relay", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let weth: WrappedNative
  let uniswapV2Pair: UniswapV2Pair
  let uniswapV2Factory: UniswapV2Factory
  let uniswapV2Router01: UniswapV2Router01
  let relay: Relay
  let relayParser: RelayParser

  beforeEach("deploy test contracts", async () => {
    ;({ token0,
        token1,
        token2,
        weth,
        uniswapV2Factory,
        uniswapV2Router01,
        uniswapV2Pair,
        relayParser,
        relay
      } = await loadFixture(relayFixture))
  })

  it("constructor initializes variables", async () => {
      expect(await relay.owner()).to.eq(wallet.address)
      expect(await relay.wnative()).to.eq(weth.address)
      expect(await relay.router()).to.eq(uniswapV2Router01.address)
      expect(await relay.gton()).to.eq(token0.address)
      expect(await relay.relayTopic()).to.eq(RELAY_TOPIC)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(relay.connect(other).setOwner(wallet.address)).to.be
        .revertedWith("ACW")
    })

    it("emits a SetOwner event", async () => {
      expect(await relay.setOwner(other.address))
        .to.emit(relay, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await relay.setOwner(other.address)
      expect(await relay.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await relay.setOwner(other.address)
      await expect(relay.setOwner(wallet.address)).to.be.revertedWith("ACW")
    })
  })
  describe("#setFees", () => {
    it("fails if caller is not owner", async () => {
      await expect(relay.connect(other).setFees(FTM_CHAIN, "19939", 0)).to.be
        .revertedWith("ACW")
    })

    it("emits a SetFees event", async () => {
      expect(await relay.setFees(FTM_CHAIN, "19939", 0))
        .to.emit(relay, "SetFees")
        .withArgs(FTM_CHAIN, "19939", 0)
    })

    it("updates owner", async () => {
      await relay.setFees(FTM_CHAIN, "19939", 0)
      expect(await relay.feeMin(FTM_CHAIN)).to.eq("19939")
      expect(await relay.feePercent(FTM_CHAIN)).to.eq(0)
    })
  })
  describe("#setLimits", () => {
    it("fails if caller is not owner", async () => {
      await expect(relay.connect(other).setLimits(FTM_CHAIN, 0, "9999")).to.be
        .revertedWith("ACW")
    })

    it("emits a setLimits event", async () => {
      expect(await relay.setLimits(FTM_CHAIN, 0, "9999"))
        .to.emit(relay, "SetLimits")
        .withArgs(FTM_CHAIN, 0, "9999")
    })

    it("updates owner", async () => {
      await relay.setLimits(FTM_CHAIN, 0, "9999")
      expect(await relay.lowerLimit(FTM_CHAIN)).to.eq(0)
      expect(await relay.upperLimit(FTM_CHAIN)).to.eq("9999")
    })
  })

  describe("#lock", () => {
    it("fails if chain is not allowed", async () => {
      await expect(relay.lock(SOL_CHAIN, wallet.address, {value: "10000"}))
        .to.be.revertedWith("R1")
    })

    it("fails if msg.value is smaller than lower limit", async () => {
      await relay.setLimits(FTM_CHAIN, "100000", MAX_UINT)
      await expect(relay.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
        .to.be.revertedWith("R2")
    })

    it("fails if msg.value is larger than upper limit", async () => {
      await relay.setLimits(FTM_CHAIN, 0, "9999")
      await expect(relay.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
        .to.be.revertedWith("R3")
    })

    it("fails if remainder after subtracting fees is equal to 0", async () => {
      await relay.setFees(FTM_CHAIN, "19939", 0)
      await expect(relay.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
        .to.be.revertedWith("R4")
    })

    it("fails if remainder after subtracting fees is less than 0", async () => {
      await relay.setFees(FTM_CHAIN, "19940", 0)
      await expect(relay.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
        .to.be.revertedWith('VM Exception while processing transaction: ' +
         'reverted with panic code 0x11 (Arithmetic operation underflowed ' +
         'or overflowed outside of an unchecked block)')
    })

    it("swaps native tokens for gton", async () => {
      await expect(relay.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
            .to.emit(relay, "CalculateFee")
            .withArgs(
              "10000",
              "19939",
              "0",
              "0",
              "0",
              "19939"
            )
            .to.emit(relay, "Lock")
            .withArgs(
                ethers.utils.solidityKeccak256(["string"], [FTM_CHAIN]),
                ethers.utils.solidityKeccak256(["bytes"], [wallet.address]),
                FTM_CHAIN,
                wallet.address.toLowerCase(),
                "19939"
            )
      expect(await token0.balanceOf(relay.address)).to.eq("19939")
    })

    it("subtracts minimum fee when it's larger than percentage", async () => {
      await relay.setFees(FTM_CHAIN, "1000", 1000)
      await expect(relay.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
            .to.emit(relay, "CalculateFee")
            .withArgs(
              "10000",
              "19939",
              "1000",
              "1000",
              "199",
              "18939"
            )
    })

    it("subtracts percentage fee when it's larger than minimum", async () => {
      await relay.setFees(FTM_CHAIN, "100", 2000)
      await expect(relay.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
            .to.emit(relay, "CalculateFee")
            .withArgs(
              "10000",
              "19939",
              "100",
              "2000",
              "398",
              "19541"
            )
    })

    it("emits event", async () => {
        await relay.setFees(FTM_CHAIN, "100", 2000)
        await expect(relay.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
            .to.emit(relay, "CalculateFee")
            .withArgs(
              "10000",
              "19939",
              "100",
              "2000",
              "398",
              "19541"
            )
    })

    it("emits event", async () => {
        await expect(relay.lock(FTM_CHAIN, wallet.address, {value: "10000"}))
            .to.emit(relay, "Lock")
            .withArgs(
                ethers.utils.solidityKeccak256(["string"], [FTM_CHAIN]),
                ethers.utils.solidityKeccak256(["bytes"], [wallet.address]),
                FTM_CHAIN,
                wallet.address.toLowerCase(),
                "19939"
            )
    })
  })

  describe("#reclaimERC20", () => {
    it("fails if caller is not owner", async () => {
      await expect(relay.connect(other).reclaimERC20(token0.address, "10000"))
          .to.be.revertedWith("ACW")
    })

    it("transfers ERC20 tokens to caller", async () => {
        let balance = await token0.balanceOf(wallet.address)
        await token0.transfer(other.address, balance.sub(10))
        await token0.transfer(relay.address, 10)
        expect(await token0.balanceOf(wallet.address)).to.eq(0)
        expect(await token0.balanceOf(relay.address)).to.eq(10)
        await relay.reclaimERC20(token0.address, 10)
        expect(await token0.balanceOf(relay.address)).to.eq(0)
        expect(await token0.balanceOf(wallet.address)).to.eq(10)
    })
  })

  describe("#reclaimNative", () => {
    it("fails if caller is not owner", async () => {
      await expect(relay.connect(other).reclaimNative(token0.address))
          .to.be.revertedWith("ACW")
    })

    it("transfers native tokens to caller", async () => {
        await relay.lock(FTM_CHAIN, wallet.address, {value: expandTo18Decimals(10)})
        expect(await wallet.provider.getBalance(relay.address)).to.eq(0)
        await relay.reclaimNative(0)
        expect(await wallet.provider.getBalance(relay.address)).to.eq(0)
    })
  })

  describe("#routeValue", async () => {
    it("transfers native tokens", async () => {
      let balance1 = await wallet.getBalance()
      await token0.transfer(relay.address, expandTo18Decimals(10))
      await relay.setCanRoute(wallet.address, true)
      await relay.routeValue(
          MOCK_UUID,
          FTM_CHAIN,
          other.address,
          RELAY_TOPIC,
          token0.address,
          wallet.address,
          wallet.address,
          "1000000000000000000"
      )
      let balance3 = await wallet.getBalance()
      expect(balance3).to.be.gt(balance1)
    })

    it("emits event", async () => {
      let balance1 = await wallet.getBalance()
      await token0.transfer(relay.address, expandTo18Decimals(10))
      await relay.setCanRoute(wallet.address, true)
      await expect(relay.routeValue(
          MOCK_UUID,
          FTM_CHAIN,
          other.address,
          RELAY_TOPIC,
          token0.address,
          wallet.address,
          wallet.address,
          "1000000000000000000"
      )).to.emit(relay, "DeliverRelay")
        .withArgs(wallet.address, "1000000000000000000", "474829737581559270")
    })

    it("transfers native tokens", async () => {
      let balance1 = await wallet.getBalance()
      await token0.transfer(relay.address, expandTo18Decimals(10))

      await relay.setCanRoute(relayParser.address, true)
      relayParser = relayParser.connect(nebula)

      let receiver = wallet.address
      let destination = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(BNB_CHAIN))
      let amount = "1000000000000000000"
      let destinationHash = ethers.utils.solidityKeccak256(["string"],[PLG_CHAIN])
      let receiverHash = ethers.utils.solidityKeccak256(["bytes"],[receiver])
      let dataEncoded = new ethers.utils.AbiCoder().encode(
        ["string", "bytes", "uint256"],[PLG_CHAIN, receiver, amount])

      let value = ethers.utils.concat([
       ethers.utils.arrayify(MOCK_UUID),
       ethers.utils.arrayify(destination),
       ethers.utils.arrayify(nebula.address),
       ethers.utils.arrayify("0x03"),
       ethers.utils.arrayify(RELAY_TOPIC),
       ethers.utils.arrayify(destinationHash),
       ethers.utils.arrayify(receiverHash),
       ethers.utils.arrayify(dataEncoded),
      ])

      await relayParser.attachValue(value)
      let balance3 = await wallet.getBalance()
      expect(balance3).to.gt(balance1)
    })

    it("transfers native tokens", async () => {
      let balance1 = await wallet.getBalance()
      await token0.transfer(relay.address, expandTo18Decimals(10))

      await relay.setCanRoute(relayParser.address, true)
      relayParser = relayParser.connect(nebula)

      let receiver = wallet.address
      let destination = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(BNB_CHAIN))
      let amount = "1000000000000000000"
      let destinationHash = ethers.utils.solidityKeccak256(["string"],[PLG_CHAIN])
      let receiverHash = ethers.utils.solidityKeccak256(["bytes"],[receiver])
      let dataEncoded = new ethers.utils.AbiCoder().encode(
        ["string", "bytes", "uint256"],[PLG_CHAIN, receiver, amount])

      let value = ethers.utils.concat([
       ethers.utils.arrayify(MOCK_UUID),
       ethers.utils.arrayify(destination),
       ethers.utils.arrayify(nebula.address),
       ethers.utils.arrayify("0x03"),
       ethers.utils.arrayify(RELAY_TOPIC),
       ethers.utils.arrayify(destinationHash),
       ethers.utils.arrayify(receiverHash),
       ethers.utils.arrayify(dataEncoded),
      ])

      await expect(relayParser.attachValue(value))
        .to.emit(relay, "DeliverRelay")
        .withArgs(wallet.address, "1000000000000000000", "474829737581559270")
    })
  })
})
