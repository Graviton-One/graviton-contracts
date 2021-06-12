import { ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers'
import { MockTimeFarmCurved } from '../../typechain/MockTimeFarmCurved'
import { ImpactKeeperTest } from '../../typechain/ImpactKeeperTest'
import { ImpactEB } from '../../typechain/ImpactEB'
import { TestERC20 } from '../../typechain/TestERC20'
import { EARLY_BIRDS_A, EARLY_BIRDS_C } from './utilities'

import { Fixture } from 'ethereum-waffle'

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_FARM_START_TIME = 1601906400

interface FarmCurvedFixture {
  farm: MockTimeFarmCurved
}

async function farmCurvedFixture(owner: string): Promise<FarmCurvedFixture> {
  const farmFactory = await ethers.getContractFactory('MockTimeFarmCurved')
  const farm = await farmFactory.deploy(owner, EARLY_BIRDS_A, EARLY_BIRDS_C) as MockTimeFarmCurved
  return { farm }
}

interface TokensFixture {
  token0: TestERC20
  token1: TestERC20
  token2: TestERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20')
  const tokenA = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenB = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenC = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { token0, token1, token2 }
}


  interface ImpactKeeperFixture extends TokensFixture {
      impactKeeper: ImpactKeeperTest
  }

export const impactKeeperFixture: Fixture<ImpactKeeperFixture> = async function ([wallet, other, nebula], provider): Promise<ImpactKeeperFixture> {
    const { token0, token1, token2 } = await tokensFixture()

    const impactKeeperFactory = await ethers.getContractFactory('ImpactKeeperTest')
    const impactKeeper = await impactKeeperFactory.deploy(
      wallet.address,
      nebula.address,
      [token1.address, token2.address]
    ) as ImpactKeeperTest
    return {
      token0,
      token1,
      token2,
      impactKeeper
    }
}

  interface ImpactEBFixture extends TokensFixture {
      impactEB: ImpactEB
  }

export const impactEBFixture: Fixture<ImpactEBFixture> = async function ([wallet, other, nebula], provider): Promise<ImpactEBFixture> {
    const { token0, token1, token2 } = await tokensFixture()

    const impactEBFactory = await ethers.getContractFactory('ImpactEB')
    const impactEB = await impactEBFactory.deploy(
      wallet.address,
      nebula.address,
      [token1.address, token2.address]
    ) as ImpactEB
    return {
      token0,
      token1,
      token2,
      impactEB
    }
}
