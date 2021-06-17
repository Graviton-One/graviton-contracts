import { ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers'
import { TestERC20 } from '../typechain/TestERC20'
import { SharesLP } from '../typechain/SharesLP'
import { BalanceKeeperV2 } from '../typechain/BalanceKeeperV2'
import { LPKeeperV2 } from '../typechain/LPKeeperV2'
import { sharesLPFixture } from './shared/fixtures'

import { expect } from './shared/expect'

describe('SharesLP', () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let lpKeeper: LPKeeperV2
  let sharesLP: SharesLP

  beforeEach('deploy test contracts', async () => {
    ;({ token0, token1, token2, balanceKeeper, lpKeeper, sharesLP } = await loadFixture(sharesLPFixture))
  })

  it('constructor initializes variables', async () => {
    expect(await sharesLP.balanceKeeper()).to.eq(balanceKeeper.address)
  })

  it('starting state after deployment', async () => {
  })

})
