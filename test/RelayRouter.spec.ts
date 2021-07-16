import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { WrappedNative } from "../typechain/WrappedNative"
import { UniswapV2Pair } from "../typechain/UniswapV2Pair"
import { UniswapV2Factory } from "../typechain/UniswapV2Factory"
import { UniswapV2Router01 } from "../typechain/UniswapV2Router01"
import { RelayRouter } from "../typechain/RelayRouter"
import { RelayParser } from "../typechain/RelayParser"
import { relayRouterFixture } from "./shared/fixtures"
import { expect } from "./shared/expect"
import {
  FTM_CHAIN,
  BNB_CHAIN,
  PLG_CHAIN,
  expandTo18Decimals,
  RELAY_TOPIC,
  MOCK_UUID
} from "./shared/utilities"

describe("LockRouter", () => {
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
  let relayRouter: RelayRouter
  let relayParser: RelayParser

  beforeEach("deploy test contracts", async () => {
    ;({ token0,
        token1,
        token2,
        weth,
        uniswapV2Factory,
        uniswapV2Router01,
        uniswapV2Pair,
        relayRouter,
        relayParser
      } = await loadFixture(relayRouterFixture))
  })

  it("constructor initializes variables", async () => {
    expect(await relayRouter.owner()).to.eq(wallet.address)
    expect(await relayRouter.wallet()).to.eq(other.address)
    expect(await relayRouter.gton()).to.eq(token0.address)
    expect(await relayRouter.relayTopic()).to.eq(RELAY_TOPIC)
    expect(await relayRouter.wnative()).to.eq(weth.address)
    expect(await relayRouter.router()).to.eq(uniswapV2Router01.address)
  })

  describe("#routeValue", async () => {
    it("transfers native tokens", async () => {
      let balance1 = await wallet.getBalance()
      await token0.transfer(other.address, expandTo18Decimals(10))
      await token0.connect(other).approve(relayRouter.address, expandTo18Decimals(10))
      await relayRouter.setCanRoute(wallet.address, true)
      await relayRouter.routeValue(
          MOCK_UUID,
          FTM_CHAIN,
          other.address,
          RELAY_TOPIC,
          token0.address,
          wallet.address,
          wallet.address,
          expandTo18Decimals(1)
      )
      let balance3 = await wallet.getBalance()
      expect(balance3).to.be.gt(balance1)
    })

    it("emits event", async () => {
      let balance1 = await wallet.getBalance()
      await token0.transfer(other.address, expandTo18Decimals(10))
      await token0.connect(other).approve(relayRouter.address, expandTo18Decimals(10))
      await relayRouter.setCanRoute(wallet.address, true)
      await expect(relayRouter.routeValue(
          MOCK_UUID,
          FTM_CHAIN,
          other.address,
          RELAY_TOPIC,
          token0.address,
          wallet.address,
          wallet.address,
          expandTo18Decimals(1)
      )).to.emit(relayRouter, "DeliverRelay")
        .withArgs(wallet.address, expandTo18Decimals(1))
    })
  })

  describe("#routeValue", async () => {
    it("transfers native tokens", async () => {
      let balance1 = await wallet.getBalance()
      await token0.transfer(other.address, expandTo18Decimals(10))
      await token0.connect(other).approve(relayRouter.address, expandTo18Decimals(10))

      await relayRouter.setCanRoute(relayParser.address, true)
      relayParser = relayParser.connect(nebula)

      let receiver = wallet.address
      let destination = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(BNB_CHAIN))
      let amount = expandTo18Decimals(10)
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
  })

  describe("#routeValue", async () => {
    it("transfers native tokens", async () => {
      let balance1 = await wallet.getBalance()
      await token0.transfer(other.address, expandTo18Decimals(10))
      await token0.connect(other).approve(relayRouter.address, expandTo18Decimals(10))

      await relayRouter.setCanRoute(relayParser.address, true)
      relayParser = relayParser.connect(nebula)

      let receiver = wallet.address
      let destination = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(BNB_CHAIN))
      let amount = expandTo18Decimals(10)
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
        .to.emit(relayRouter, "DeliverRelay")
        .withArgs(wallet.address, expandTo18Decimals(10))
    })
  })
})
