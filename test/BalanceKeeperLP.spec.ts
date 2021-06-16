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
    expect(await balanceKeeperLP.isKnownLPToken(token1.address)).to.eq(false)
    expect(await balanceKeeperLP.isKnownLPToken(token2.address)).to.eq(false)
    expect(await balanceKeeperLP.totalBalance(token1.address)).to.eq(0)
    expect(await balanceKeeperLP.totalBalance(token2.address)).to.eq(0)
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

  describe('#setCanAdd', () => {
    it('fails if caller is not owner', async () => {
      await expect(balanceKeeperLP.connect(other).setCanAdd(wallet.address, true)).to.be.reverted
    })

    it('sets permission to true', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      expect(await balanceKeeperLP.canAdd(wallet.address)).to.eq(true)
    })

    it('sets permission to true idempotent', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      expect(await balanceKeeperLP.canAdd(wallet.address)).to.eq(true)
    })

    it('sets permission to false', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.setCanAdd(wallet.address, false)
      expect(await balanceKeeperLP.canAdd(wallet.address)).to.eq(false)
    })

    it('sets permission to false idempotent', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.setCanAdd(wallet.address, false)
      await balanceKeeperLP.setCanAdd(wallet.address, false)
      expect(await balanceKeeperLP.canAdd(wallet.address)).to.eq(false)
    })

    it('emits event', async () => {
      await expect(balanceKeeperLP.setCanAdd(other.address, true))
        .to.emit(balanceKeeperLP, 'SetCanAdd')
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe('#setCanSubtract', () => {
    it('fails if caller is not owner', async () => {
      await expect(balanceKeeperLP.connect(other).setCanSubtract(wallet.address, true)).to.be.reverted
    })

    it('sets permission to true', async () => {
      await balanceKeeperLP.setCanSubtract(wallet.address, true)
      expect(await balanceKeeperLP.canSubtract(wallet.address)).to.eq(true)
    })

    it('sets permission to true idempotent', async () => {
      await balanceKeeperLP.setCanSubtract(wallet.address, true)
      await balanceKeeperLP.setCanSubtract(wallet.address, true)
      expect(await balanceKeeperLP.canSubtract(wallet.address)).to.eq(true)
    })

    it('sets permission to false', async () => {
      await balanceKeeperLP.setCanSubtract(wallet.address, true)
      await balanceKeeperLP.setCanSubtract(wallet.address, false)
      expect(await balanceKeeperLP.canSubtract(wallet.address)).to.eq(false)
    })

    it('sets permission to false idempotent', async () => {
      await balanceKeeperLP.setCanSubtract(wallet.address, false)
      await balanceKeeperLP.setCanSubtract(wallet.address, false)
      expect(await balanceKeeperLP.canSubtract(wallet.address)).to.eq(false)
    })

    it('emits event', async () => {
      await expect(balanceKeeperLP.setCanSubtract(other.address, true))
        .to.emit(balanceKeeperLP, 'SetCanSubtract')
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe('#add', () => {
    it('fails if caller is not allowed to add', async () => {
      await expect(balanceKeeperLP.add(token1.address, other.address, 1)).to.be.reverted
    })

    it('records a new user', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, other.address, 1)
      expect(await balanceKeeperLP.userIsKnown(token1.address, other.address)).to.eq(true)
      expect(await balanceKeeperLP.users(token1.address, 0)).to.eq(other.address)
      expect(await balanceKeeperLP.totalUsers(token1.address)).to.eq(1)
    })

    it('does not record a known user', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, other.address, 1)
      await balanceKeeperLP.add(token1.address, other.address, 1)
      await expect(balanceKeeperLP.users(token1.address, 1)).to.be.reverted
      expect(await balanceKeeperLP.totalUsers(token1.address)).to.eq(1)
    })

    it('adds to user balance', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, wallet.address, 1)
      expect(await balanceKeeperLP.userBalance(token1.address, wallet.address)).to.eq(1)
    })

    it('adds to total balance', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, wallet.address, 1)
      expect(await balanceKeeperLP.totalBalance(token1.address)).to.eq(1)
    })

    it('adds each value to total balance', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, wallet.address, 1)
      await balanceKeeperLP.add(token1.address, other.address, 1)
      expect(await balanceKeeperLP.totalBalance(token1.address)).to.eq(2)
    })

    it('emits event', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await expect(balanceKeeperLP.add(token1.address, other.address, 1))
        .to.emit(balanceKeeperLP, 'Add')
        .withArgs(wallet.address, token1.address, other.address, 1)
    })
  })

  describe('#subtract', () => {
    it('fails if caller is not allowed to subtract', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, other.address, 1)
      await expect(balanceKeeperLP.subtract(token1.address, other.address, 1)).to.be.reverted
    })

    it('fails if there is nothing to subtract', async () => {
      await balanceKeeperLP.setCanSubtract(wallet.address, true)
      await expect(balanceKeeperLP.subtract(token1.address, other.address, 1)).to.be.reverted
    })

    it('subtracts from user balance', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, other.address, 2)
      await balanceKeeperLP.setCanSubtract(wallet.address, true)
      await balanceKeeperLP.subtract(token1.address, other.address, 1)
      expect(await balanceKeeperLP.userBalance(token1.address, other.address)).to.eq(1)
    })

    it('subtracts from total balance', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, other.address, 2)
      await balanceKeeperLP.setCanSubtract(wallet.address, true)
      await balanceKeeperLP.subtract(token1.address, other.address, 1)
      expect(await balanceKeeperLP.totalBalance(token1.address)).to.eq(1)
    })

    it('emits event', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, other.address, 2)
      await balanceKeeperLP.setCanSubtract(wallet.address, true)
      await expect(balanceKeeperLP.subtract(token1.address, other.address, 1))
        .to.emit(balanceKeeperLP, 'Subtract')
        .withArgs(wallet.address, token1.address, other.address, 1)
    })
  })

  describe('#totalLPTokens', () => {
    it('returns the number of LP tokens', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, wallet.address, 1)
      expect(await balanceKeeperLP.totalLPTokens()).to.eq(1)
    })

    it('returns the number of LP tokens', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, wallet.address, 1)
      await balanceKeeperLP.add(token2.address, wallet.address, 1)
      expect(await balanceKeeperLP.totalLPTokens()).to.eq(2)
    })
  })

  describe('#totalUsers', () => {
    it('returns the number of users for an LP token', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, wallet.address, 1)
      expect(await balanceKeeperLP.totalUsers(token1.address)).to.eq(1)
    })

    it('returns the number of users for an LP token', async () => {
      await balanceKeeperLP.setCanAdd(wallet.address, true)
      await balanceKeeperLP.add(token1.address, wallet.address, 1)
      await balanceKeeperLP.add(token1.address, other.address, 1)
      expect(await balanceKeeperLP.totalUsers(token1.address)).to.eq(2)
    })
  })

})
