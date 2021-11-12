import { ethers, waffle } from "hardhat"
import { BigNumber } from "ethers"
import { UniswapV2Factory } from "../../uniswap-v2-core/typechain/UniswapV2Factory"
import { UniswapV2Pair } from "../../uniswap-v2-core/typechain/UniswapV2Pair"
import { ERC20 } from "../../uniswap-v2-core/typechain/ERC20"
import { UniswapV2Router02 } from "../../uniswap-v2-periphery/typechain/UniswapV2Router02"
import { WETH9 } from "../../uniswap-v2-periphery/typechain/WETH9"
import { CandyShop } from "../typechain/CandyShop"
import { Can } from "../typechain/Can"
import { poolFixture } from "./shared/fixtures"

import { expect } from "../../../test/shared/expect"

describe("CandyShop", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let weth: WETH9
  let token0: ERC20
  let token1: ERC20
  let token2: ERC20
  let factory: UniswapV2Factory
  let lpToken: UniswapV2Pair
  let router: UniswapV2Router02

  beforeEach("deploy test contracts", async () => {
    ;({
      weth,
      token0,
      token1,
      token2,
      factory,
      router,
      lpToken,
    } = await loadFixture(poolFixture))
  })

  it("constructor initializes variables", async () => {

  })
})
