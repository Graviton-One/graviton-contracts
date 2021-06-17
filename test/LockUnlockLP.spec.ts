import { ethers, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { LockUnlockLP } from '../typechain/LockUnlockLP'
import { lockUnlockLPFixture } from './shared/fixtures'

import { expect } from './shared/expect'

describe('LockUnlockLP', () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let lockUnlockLP: LockUnlockLP

  beforeEach('deploy test contracts', async () => {
    ;({ token0, token1, token2, lockUnlockLP } = await loadFixture(lockUnlockLPFixture))
  })

  it('constructor initializes variables', async () => {
    expect(await lockUnlockLP.owner()).to.eq(wallet.address)
    expect(await lockUnlockLP.isAllowedToken(token1.address)).to.eq(true)
    expect(await lockUnlockLP.isAllowedToken(token2.address)).to.eq(false)
    expect(await lockUnlockLP.balance(token1.address, wallet.address)).to.eq(0)
  })

  it('starting state after deployment', async () => {
    expect(await token1.balanceOf(lockUnlockLP.address)).to.eq(0)
  })

  describe('#setOwner', () => {
    it('fails if caller is not owner', async () => {
      await expect(lockUnlockLP.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it('emits a SetOwner event', async () => {
      expect(await lockUnlockLP.setOwner(other.address))
        .to.emit(lockUnlockLP, 'SetOwner')
        .withArgs(wallet.address, other.address)
    })

    it('updates owner', async () => {
      await lockUnlockLP.setOwner(other.address)
      expect(await lockUnlockLP.owner()).to.eq(other.address)
    })

    it('cannot be called by original owner', async () => {
      await lockUnlockLP.setOwner(other.address)
      await expect(lockUnlockLP.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe('#setIsAllowedToken', () => {
    it('updates token permission to true', async () => {
      await lockUnlockLP.setIsAllowedToken(token2.address, true)
      expect(await lockUnlockLP.isAllowedToken(token2.address)).to.eq(true)
    })

    it('updates token permission to false', async () => {
      await lockUnlockLP.setIsAllowedToken(token1.address, false)
      expect(await lockUnlockLP.isAllowedToken(token1.address)).to.eq(false)
    })
  })

  describe('#balance', () => {
    it('returns user token balance', async () => {
      await token1.approve(lockUnlockLP.address, 1)
      await lockUnlockLP.lock(token1.address, wallet.address, 1)
      expect(await lockUnlockLP.balance(token1.address, wallet.address)).to.eq(1)
      expect(await token1.balanceOf(lockUnlockLP.address)).to.eq(1)
    })
  })

  describe('#lock', () => {
    it('fails if token is not allowed', async () => {
      await token1.approve(lockUnlockLP.address, 1)
      await expect(lockUnlockLP.lock(token2.address, wallet.address, 0)).to.be.reverted
    })

    it('locks tokens', async () => {
      await token1.approve(lockUnlockLP.address, 1)
      await lockUnlockLP.lock(token1.address, wallet.address, 1)
      expect(await lockUnlockLP.balance(token1.address, wallet.address)).to.eq(1)
      expect(await token1.balanceOf(lockUnlockLP.address)).to.eq(1)
    })

    it('emits event', async () => {
      await token1.approve(lockUnlockLP.address, 1)
      await expect(lockUnlockLP.lock(token1.address, wallet.address, 1))
        .to.emit(lockUnlockLP, "Lock")
        .withArgs(token1.address, wallet.address, wallet.address, 1)
    })
  })

  describe('#unlock', () => {
    it('fails if token is not allowed', async () => {
      await token1.approve(lockUnlockLP.address, 2)
      await lockUnlockLP.lock(token1.address, wallet.address, 2)
      await lockUnlockLP.setIsAllowedToken(token1.address, false)
      await expect(lockUnlockLP.unlock(token1.address, wallet.address, 1)).to.be.reverted
    })

    it('fails if balance is smaller than unlock amount', async () => {
      await token1.approve(lockUnlockLP.address, 2)
      await lockUnlockLP.lock(token1.address, wallet.address, 2)
      await expect(lockUnlockLP.unlock(token1.address, wallet.address, 3)).to.be.reverted
    })

    it('unlocks tokens', async () => {
      await token1.approve(lockUnlockLP.address, 2)
      await lockUnlockLP.lock(token1.address, wallet.address, 2)
      await lockUnlockLP.unlock(token1.address, wallet.address, 1)
      expect(await lockUnlockLP.balance(token1.address, wallet.address)).to.eq(1)
    })

    it('emits event', async () => {
      await token1.approve(lockUnlockLP.address, 2)
      await lockUnlockLP.lock(token1.address, wallet.address, 2)
      await expect(lockUnlockLP.unlock(token1.address, wallet.address, 1))
        .to.emit(lockUnlockLP, "Unlock")
        .withArgs(token1.address, wallet.address, wallet.address, 1)
    })
  })
})
