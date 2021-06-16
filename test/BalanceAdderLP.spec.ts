import { ethers, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { MockTimeFarmCurved } from '../typechain/MockTimeFarmCurved'
import { BalanceKeeper } from '../typechain/BalanceKeeper'
import { LPKeeper } from '../typechain/LPKeeper'
import { BalanceAdderLP } from '../typechain/BalanceAdderLP'
import { balanceAdderLPFixture } from './shared/fixtures'
import { expect } from './shared/expect'

describe('BalanceAdderLP', () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeper
  let lpKeeper: LPKeeper
  let farm: MockTimeFarmCurved
  let balanceAdderLP: BalanceAdderLP

  beforeEach('deploy test contracts', async () => {
    ;({ token0, token1, token2, farm, balanceKeeper, lpKeeper, balanceAdderLP } = await loadFixture(balanceAdderLPFixture))
  })

  it('constructor initializes variables', async () => {
    expect(await balanceAdderLP.farm()).to.eq(farm.address)
    expect(await balanceAdderLP.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await balanceAdderLP.lpKeeper()).to.eq(lpKeeper.address)
  })

  it('starting state after deployment', async () => {
    expect(await balanceAdderLP.currentPortion(token1.address)).to.eq(0)
    expect(await balanceAdderLP.currentPortion(token2.address)).to.eq(0)
    expect(await balanceAdderLP.lastPortion(token1.address)).to.eq(0)
    expect(await balanceAdderLP.lastPortion(token2.address)).to.eq(0)
    expect(await balanceAdderLP.counter(token1.address)).to.eq(0)
    expect(await balanceAdderLP.counter(token2.address)).to.eq(0)
  })
})
