import { ethers, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { MockTimeFarmCurved } from '../typechain/MockTimeFarmCurved'
import { BalanceKeeper } from '../typechain/BalanceKeeper'
import { BalanceKeeperLP } from '../typechain/BalanceKeeperLP'
import { balanceKeeperLPFixture } from './shared/fixtures'
import { expect } from './shared/expect'

describe('BalanceKeeperLP', () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeperLP: BalanceKeeperLP

  beforeEach('deploy test contracts', async () => {
    ;({ token0, token1, token2, balanceKeeperLP } = await loadFixture(balanceKeeperLPFixture))
  })

  it('constructor initializes variables', async () => {
    expect(await balanceKeeperLP.owner()).to.eq(wallet.address)
  })

  it('starting state after deployment', async () => {
    await expect(balanceKeeperLP.lpTokens(0)).to.be.reverted
    expect(await balanceKeeperLP.lpTokenIsKnown(token1.address)).to.eq(false)
    expect(await balanceKeeperLP.lpTokenIsKnown(token2.address)).to.eq(false)
    expect(await balanceKeeperLP.supply(token1.address)).to.eq(0)
    expect(await balanceKeeperLP.supply(token2.address)).to.eq(0)
    await expect(balanceKeeperLP.users(token1.address, 0)).to.be.reverted
    await expect(balanceKeeperLP.users(token2.address, 0)).to.be.reverted
    expect(await balanceKeeperLP.userIsKnown(token1.address, wallet.address)).to.eq(false)
    expect(await balanceKeeperLP.userIsKnown(token1.address, other.address)).to.eq(false)
    expect(await balanceKeeperLP.userIsKnown(token2.address, wallet.address)).to.eq(false)
    expect(await balanceKeeperLP.userIsKnown(token2.address, other.address)).to.eq(false)
    expect(await balanceKeeperLP.userBalance(token1.address, wallet.address)).to.eq(0)
    expect(await balanceKeeperLP.userBalance(token1.address, other.address)).to.eq(0)
    expect(await balanceKeeperLP.userBalance(token2.address, wallet.address)).to.eq(0)
    expect(await balanceKeeperLP.userBalance(token2.address, other.address)).to.eq(0)
    expect(await balanceKeeperLP.canAdd(wallet.address)).to.eq(false)
    expect(await balanceKeeperLP.canAdd(other.address)).to.eq(false)
    expect(await balanceKeeperLP.canSubtract(wallet.address)).to.eq(false)
    expect(await balanceKeeperLP.canSubtract(other.address)).to.eq(false)
  })

  describe('#setOwner', () => {
    it('fails if caller is not owner', async () => {
      await expect(balanceKeeperLP.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it('emits a SetOwner event', async () => {
      expect(await balanceKeeperLP.setOwner(other.address))
        .to.emit(balanceKeeperLP, 'SetOwner')
        .withArgs(wallet.address, other.address)
    })

    it('updates owner', async () => {
      await balanceKeeperLP.setOwner(other.address)
      expect(await balanceKeeperLP.owner()).to.eq(other.address)
    })

    it('cannot be called by original owner', async () => {
      await balanceKeeperLP.setOwner(other.address)
      await expect(balanceKeeperLP.setOwner(wallet.address)).to.be.reverted
    })
  })
})
