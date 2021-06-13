import { ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers'
import { TestERC20 } from '../../typechain/TestERC20'
import { ImpactKeeperTest } from '../../typechain/ImpactKeeperTest'
import { MockTimeFarmCurved } from '../../typechain/MockTimeFarmCurved'
import { ImpactEB } from '../../typechain/ImpactEB'
import { BalanceKeeper } from '../../typechain/BalanceKeeper'
import { BalanceEB } from '../../typechain/BalanceEB'
import { Voter } from '../../typechain/Voter'
import { makeValue, EARLY_BIRDS_A, EARLY_BIRDS_C } from './utilities'

import { Fixture } from 'ethereum-waffle'

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

interface BalanceKeeperFixture {
  balanceKeeper: BalanceKeeper
}

async function balanceKeeperFixture(owner: string): Promise<BalanceKeeperFixture> {
  const balanceKeeperFactory = await ethers.getContractFactory('BalanceKeeper')
  const balanceKeeper = await balanceKeeperFactory.deploy(owner) as BalanceKeeper
  return { balanceKeeper }
}

type FarmAndImpactEBAndBalanceKeeperFixture = FarmCurvedFixture & ImpactEBFixture & BalanceKeeperFixture

  interface BalanceEBFixture extends FarmAndImpactEBAndBalanceKeeperFixture {
      balanceEB: BalanceEB
  }

export const balanceEBFixture: Fixture<BalanceEBFixture> = async function ([wallet, other, nebula], provider): Promise<BalanceEBFixture> {
    const { farm } = await farmCurvedFixture(wallet.address)
    const { token0, token1, token2, impactEB } = await impactEBFixture([wallet, other, nebula], provider)
    const { balanceKeeper } = await balanceKeeperFixture(wallet.address)

    await impactEB.connect(nebula).attachValue(makeValue(token1.address, wallet.address, "1000", "0", "0"))
    await impactEB.connect(nebula).attachValue(makeValue(token2.address, other.address, "1000", "1", "0"))

    const balanceEBFactory = await ethers.getContractFactory('BalanceEB')
    const balanceEB = await balanceEBFactory.deploy(
      farm.address,
      impactEB.address,
      balanceKeeper.address
    ) as BalanceEB
    return {
      farm,
      token0,
      token1,
      token2,
      impactEB,
      balanceKeeper,
      balanceEB
    }
}

  interface VoterFixture extends BalanceKeeperFixture {
      voter: Voter
  }

export const voterFixture: Fixture<VoterFixture> = async function ([wallet, other], provider): Promise<VoterFixture> {
    const { balanceKeeper } = await balanceKeeperFixture(wallet.address)

    const voterFactory = await ethers.getContractFactory('Voter')
    const voter = await voterFactory.deploy(
      wallet.address,
      balanceKeeper.address
    ) as Voter
    return {
      balanceKeeper,
      voter
    }
}
