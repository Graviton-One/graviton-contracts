import { ethers } from "hardhat"
import { BigNumber } from "ethers"
import { Fixture } from "ethereum-waffle"
import { getFactory } from "./utils"

/**
 * Factories
 */
import { UniswapV2Factory__factory as factoryMeta } from "../../../uniswap-v2-core/typechain/factories/UniswapV2Factory__factory"
import { UniswapV2Pair__factory as pairMeta } from "../../../uniswap-v2-core/typechain/factories/UniswapV2Pair__factory"
import { UniswapV2Router02__factory as routerMeta } from "../../../uniswap-v2-periphery/typechain/factories/UniswapV2Router02__factory"
import { ERC20__factory as erc20Meta } from "../../../uniswap-v2-core/typechain/factories/ERC20__factory"
import { WETH9__factory as wethMeta } from "../../../uniswap-v2-periphery/typechain/factories/WETH9__factory"

/**
 * Contracts
 */
import { UniswapV2Factory } from "../../../uniswap-v2-core/typechain/UniswapV2Factory"
import { UniswapV2Pair } from "../../../uniswap-v2-core/typechain/UniswapV2Pair"
import { ERC20 } from "../../../uniswap-v2-core/typechain/ERC20"

import { UniswapV2Router02 } from "../../../uniswap-v2-periphery/typechain/UniswapV2Router02"
import { WETH9 } from "../../../uniswap-v2-periphery/typechain/WETH9"

import { BigBanger } from "../../../farms/typechain/BigBanger"

import { CandyShop } from "../../typechain/CandyShop"
import { Can } from "../../typechain/Can"

interface TokensFixture {
  weth: WETH9
  token0: ERC20
  token1: ERC20
  token2: ERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  // @ts-ignore
  const factory = await getFactory(erc20Meta);
  const factoryWeth = await getFactory(wethMeta);
  const tokenA = (await factory.deploy(BigNumber.from(2).pow(255))) as ERC20
  const tokenB = (await factory.deploy(BigNumber.from(2).pow(255))) as ERC20
  const tokenC = (await factory.deploy(BigNumber.from(2).pow(255))) as ERC20
  const weth = (await factoryWeth.deploy()) as WETH9

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort(
    (tokenA, tokenB) =>
      tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { weth, token0, token1, token2 }
}

interface PoolFixture extends TokensFixture {
  factory: UniswapV2Factory
  router: UniswapV2Router02
  lpToken: UniswapV2Pair
}

export const poolFixture: Fixture<PoolFixture> = async function ([
  wallet,
]): Promise<PoolFixture> {
  const { weth, token0, token1, token2 } = await tokensFixture()
  const factoryFactory = await getFactory(factoryMeta);
  const pairFactory = await getFactory(pairMeta);
  const factory = (await factoryFactory.deploy(
    wallet.address
  )) as UniswapV2Factory
  await factory.createPair(token0.address, token1.address)
  const lpTokenAddress = await factory.allPairs(0)
  const lpToken = pairFactory.attach(lpTokenAddress) as UniswapV2Pair
  const routerFactory = await getFactory(routerMeta);
  const router = (await routerFactory.deploy(
    factory.address,
    weth.address
  )) as UniswapV2Router02

  return {
    weth,
    token0,
    token1,
    token2,
    factory,
    router,
    lpToken,
  }
}

interface CandyShopFixture extends PoolFixture {
  farm: BigBanger;
  candy: CandyShop
  canToken: Can
}

export const candyShopFixture: Fixture<CandyShopFixture> = async function (
  [wallet],
  provider
): Promise<CandyShopFixture> {
  const { weth, token0, token1, token2, factory, router, lpToken } =
    await poolFixture([wallet], provider)

  return {
    weth,
    token0,
    token1,
    token2,
    factory,
    router,
    lpToken,
  }
}
