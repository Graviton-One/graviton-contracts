import { ethers, waffle } from "hardhat"
import { BigNumber } from "ethers"
import { TestERC20 } from "../typechain/TestERC20"
import { WrappedNative } from "../typechain/WrappedNative"
import { UniswapV2Pair } from "../typechain/UniswapV2Pair"
import { UniswapV2Factory } from "../typechain/UniswapV2Factory"
import { UniswapV2Router01 } from "../typechain/UniswapV2Router01"
import { ILogger } from "../typechain/ILogger"
import { IRelay } from "../typechain/IRelay"
import { RelayParser } from "../typechain/RelayParser"
import { uniswapFixture } from "./shared/fixtures"
import { expect } from "./shared/expect"
import {
  FTM_CHAIN,
  PLG_CHAIN,
  expandTo18Decimals,
  EMPTY_TOPIC,
  RELAY_TOPIC,
  MOCK_UUID,
  MAX_UINT,
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
  let logger: ILogger
  let relay: IRelay

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, weth } = await loadFixture(uniswapFixture))

    const routerABI = [
      "function swapExactTokensForTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts)",
    ]
    const router = await waffle.deployMockContract(wallet, routerABI)
    await router.mock.swapExactTokensForTokens.returns([
      "5000000000000000",
      "180435828284893555",
    ])

    const loggerFactory = await ethers.getContractFactory("Logger")
    logger = (await loggerFactory.deploy()) as ILogger

    const relayFactory = await ethers.getContractFactory("Relay")
    relay = (await relayFactory.deploy(
      weth.address,
      router.address,
      token0.address,
      logger.address,
      FTM_CHAIN,
      [PLG_CHAIN],
      [[0, 0, 30]],
      [[0, MAX_UINT]]
    )) as IRelay
  })

  describe("#lock", () => {
    it("logs", async () => {
      const tx = await relay.lock(PLG_CHAIN, wallet.address, {
        value: "5000000000000000",
      })
      const receipt = await tx.wait()
      // console.log(receipt.logs)
      const log = receipt.logs[3]
      const topic0 = log.topics[0]
      const topic1 = log.topics[1]
      const topic2 = log.topics[2]
      const topic3 = EMPTY_TOPIC
      const data = log.data
      // console.log(data)
      const _log = ethers.utils.hexlify(
        ethers.utils.concat([topic0, topic1, topic2, topic3, data])
      )

      const logSC = await logger.logs(
        "0x9ad6eaa2522e1b99d2c6a91200ab3c4d4c55cb9fcc3df859bb32b5b8818260fc",
        0
      )

      expect(_log).to.eq(logSC)
    })
  })
})
