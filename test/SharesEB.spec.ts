import { ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers'
import { TestERC20 } from '../typechain/TestERC20'
import { SharesEB } from '../typechain/SharesEB'
import { ImpactEB } from '../typechain/ImpactEB'
import { BalanceKeeperV2 } from '../typechain/BalanceKeeperV2'
import { sharesEBFixture } from './shared/fixtures'

import { expect } from './shared/expect'

describe('SharesEB', () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let impactEB: ImpactEB
  let balanceKeeper: BalanceKeeperV2
  let sharesEB: SharesEB

  beforeEach('deploy test contracts', async () => {
    ;({ token0, token1, token2, impactEB, balanceKeeper, sharesEB } = await loadFixture(sharesEBFixture))
  })

  it('constructor initializes variables', async () => {
    expect(await sharesEB.balanceKeeper()).to.eq(balanceKeeper.address)
  })

  it('starting state after deployment', async () => {
  })

})
