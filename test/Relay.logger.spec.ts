// f518d190e6fc4d738ef7cc2b19ac09bd424e42de87ca6b2e0ff2913f2bc14232aaf400fc3826d303a4f88aed847e87bafdc18210d88464dc24f71fa4bf1b4672710c9bc876bb00440a2aa6bd5eade2875edce58d3659f6809600dcc1f9f500e828c1bc0e54f5c3a3ff8ba787b130ef0b77a846da9e5c9f422e342a47d83db27a613b57fd2bd410fc000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000280d832bda3ba170000000000000000000000000000000000000000000000000000000000000003504c4700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014e341fbf7bbd43e06f4eadab1ad9e41b01b074bdb000000000000000000000000
// f518d190e6fc4d738ef7cc2b19ac09bd
// 424e42
// de87ca6b2e0ff2913f2bc14232aaf400fc3826d3
// 03
// a4f88aed847e87bafdc18210d88464dc24f71fa4bf1b4672710c9bc876bb0044
// 0a2aa6bd5eade2875edce58d3659f6809600dcc1f9f500e828c1bc0e54f5c3a3
// ff8ba787b130ef0b77a846da9e5c9f422e342a47d83db27a613b57fd2bd410fc
// 0000000000000000000000000000000000000000000000000000000000000060
// 00000000000000000000000000000000000000000000000000000000000000a0
// 0000000000000000000000000000000000000000000000000280d832bda3ba17
// 0000000000000000000000000000000000000000000000000000000000000003
// 504c470000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000014
// e341fbf7bbd43e06f4eadab1ad9e41b01b074bdb000000000000000000000000

// https://bscscan.com/tx/0x0ecb9d49ad4ef7a0bf17efb2400d2ae8097f7484083e636a863950c4ee057d77#eventlog

// Function: lock(string destination, bytes receiver)
// e341fbf7bbd43e06f4eadab1ad9e41b01b074bdb
// PLG
// 5000000000000000

// swap -> relay
// Transfer (index_topic_1 address src, index_topic_2 address dst, uint256 wad)View Source
// 180435828284893555

// Sync (uint112 reserve0, uint112 reserve1)View Source
//     reserve0 :1059354008829527581302
//     reserve1 :29287034334638938409

// Swap (index_topic_1 address sender,
// uint256 amount0In,
// uint256 amount1In,
// uint256 amount0Out,
// uint256 amount1Out,
// index_topic_2 address to)
// amount0In :0
// amount1In :5000000000000000
// amount0Out :180435828284893555
// amount1Out :0

// CalculateFee (
//     uint256 amountIn,
//     uint256 amountOut,
//     uint256 feeMin,
//     uint256 feePercent,
//     uint256 fee,
//     uint256 amountMinusFee)
// amountIn :5000000000000000
// amountOut :180435828284893555
// feeMin :0
// feePercent :30
// fee :54130748485468
// amountMinusFee :180381697536408087

// Lock (
//     index_topic_1 string destinationHash,
//     index_topic_2 bytes receiverHash,
//     string destination,
//     bytes receiver,
//     uint256 amount)
// destination :PLG
// receiver :E341FBF7BBD43E06F4EADAB1AD9E41B01B074BDB
// amount :180381697536408087

import { ethers, waffle } from "hardhat"
import { BigNumber } from "ethers"
import { TestERC20 } from "../typechain/TestERC20"
import { WrappedNative } from "../typechain/WrappedNative"
import { UniswapV2Pair } from "../typechain/UniswapV2Pair"
import { UniswapV2Factory } from "../typechain/UniswapV2Factory"
import { UniswapV2Router01 } from "../typechain/UniswapV2Router01"
import { Relay } from "../typechain/Relay"
import { RelayParser } from "../typechain/RelayParser"
import { uniswapFixture } from "./shared/fixtures"
import { expect } from "./shared/expect"
import {
  PLG_CHAIN,
  expandTo18Decimals,
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
  let relay: Relay

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

    const relayFactory = await ethers.getContractFactory("Relay")
    relay = (await relayFactory.deploy(
      weth.address,
      router.address,
      token0.address,
      RELAY_TOPIC,
      [PLG_CHAIN],
      [[0, 30]],
      [[0, MAX_UINT]]
    )) as Relay
  })

  describe("#", () => {
    it.only("", async () => {
      const tx = await relay.lock(PLG_CHAIN, wallet.address, {
        value: "5000000000000000",
      })
      const receipt = await tx.wait()
      console.log()
      const log = receipt.logs[3]
      const topic0 = log.topics[0]
      const topic1 = log.topics[1]
      const topic2 = log.topics[2]
      const data = log.data
      // topics: [
      //   '0xa4f88aed847e87bafdc18210d88464dc24f71fa4bf1b4672710c9bc876bb0044',
      //   '0x0a2aa6bd5eade2875edce58d3659f6809600dcc1f9f500e828c1bc0e54f5c3a3',
      //   '0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9'
      // ],
      // data: '0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000281096e09aca9730000000000000000000000000000000000000000000000000000000000000003504c4700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000',
      // 0000000000000000000000000000000000000000000000000000000000000060
      // 00000000000000000000000000000000000000000000000000000000000000a0
      // 0000000000000000000000000000000000000000000000000280d832bda3ba17
      // 0000000000000000000000000000000000000000000000000000000000000003
      // 504c470000000000000000000000000000000000000000000000000000000000
      // 0000000000000000000000000000000000000000000000000000000000000014
      // f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000
      const logSC = await relay.logs(0)
      console.log(logSC)
      expect(topic0).to.eq(logSC)

      // a4f88aed847e87bafdc18210d88464dc24f71fa4bf1b4672710c9bc876bb0044
      // 0a2aa6bd5eade2875edce58d3659f6809600dcc1f9f500e828c1bc0e54f5c3a3
      // e9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9
      // 0000000000000000000000000000000000000000000000000000000000000060
      // 00000000000000000000000000000000000000000000000000000000000000a0
      // 0000000000000000000000000000000000000000000000000280d832bda3ba17
      // 0000000000000000000000000000000000000000000000000000000000000003
      // 504c470000000000000000000000000000000000000000000000000000000000
      // 0000000000000000000000000000000000000000000000000000000000000014
      // f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000
    })
  })
})
