import { ethers, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { MockTimeFarmCurved } from '../typechain/MockTimeFarmCurved'
import { BalanceKeeperV2 } from '../typechain/BalanceKeeperV2'
import { LPKeeperV2 } from '../typechain/LPKeeperV2'
import { lpKeeperV2Fixture } from './shared/fixtures'
import { MOCK_CHAIN } from './shared/utilities'
import { expect } from './shared/expect'

describe('LPKeeperV2', () => {
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

  beforeEach('deploy test contracts', async () => {
    ;({ token0, token1, token2, balanceKeeper, lpKeeper } = await loadFixture(lpKeeperV2Fixture))
  })

  it('constructor initializes variables', async () => {
    expect(await lpKeeper.owner()).to.eq(wallet.address)
  })

  it('starting state after deployment', async () => {
    expect(await lpKeeper['isKnownToken(string,bytes)'](MOCK_CHAIN, token1.address)).to.eq(false)
    expect(await lpKeeper['isKnownToken(string,bytes)'](MOCK_CHAIN, token2.address)).to.eq(false)
    expect(await lpKeeper['totalBalance(string,bytes)'](MOCK_CHAIN, token1.address)).to.eq(0)
    expect(await lpKeeper['totalBalance(string,bytes)'](MOCK_CHAIN, token2.address)).to.eq(0)
    expect(await lpKeeper['isKnownTokenUser(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(false)
    expect(await lpKeeper['isKnownTokenUser(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, other.address)).to.eq(false)
    expect(await lpKeeper['isKnownTokenUser(string,bytes,string,bytes)'](MOCK_CHAIN, token2.address, MOCK_CHAIN, wallet.address)).to.eq(false)
    expect(await lpKeeper['isKnownTokenUser(string,bytes,string,bytes)'](MOCK_CHAIN, token2.address, MOCK_CHAIN, other.address)).to.eq(false)
    expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(0)
    expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, other.address)).to.eq(0)
    expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token2.address, MOCK_CHAIN, wallet.address)).to.eq(0)
    expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token2.address, MOCK_CHAIN, other.address)).to.eq(0)
    expect(await lpKeeper.canAdd(wallet.address)).to.eq(false)
    expect(await lpKeeper.canAdd(other.address)).to.eq(false)
    expect(await lpKeeper.canSubtract(wallet.address)).to.eq(false)
    expect(await lpKeeper.canSubtract(other.address)).to.eq(false)
  })

  describe('#setOwner', () => {
    it('fails if caller is not owner', async () => {
      await expect(lpKeeper.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it('emits a SetOwner event', async () => {
      expect(await lpKeeper.setOwner(other.address))
        .to.emit(lpKeeper, 'SetOwner')
        .withArgs(wallet.address, other.address)
    })

    it('updates owner', async () => {
      await lpKeeper.setOwner(other.address)
      expect(await lpKeeper.owner()).to.eq(other.address)
    })

    it('cannot be called by original owner', async () => {
      await lpKeeper.setOwner(other.address)
      await expect(lpKeeper.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe('#setCanAdd', () => {
    it('fails if caller is not owner', async () => {
      await expect(lpKeeper.connect(other).setCanAdd(wallet.address, true)).to.be.reverted
    })

    it('sets permission to true', async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(true)
    })

    it('sets permission to true idempotent', async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, true)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(true)
    })

    it('sets permission to false', async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, false)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(false)
    })

    it('sets permission to false idempotent', async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, false)
      await lpKeeper.setCanAdd(wallet.address, false)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(false)
    })

    it('emits event', async () => {
      await expect(lpKeeper.setCanAdd(other.address, true))
        .to.emit(lpKeeper, 'SetCanAdd')
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe('#setCanSubtract', () => {
    it('fails if caller is not owner', async () => {
      await expect(lpKeeper.connect(other).setCanSubtract(wallet.address, true)).to.be.reverted
    })

    it('sets permission to true', async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(true)
    })

    it('sets permission to true idempotent', async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper.setCanSubtract(wallet.address, true)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(true)
    })

    it('sets permission to false', async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper.setCanSubtract(wallet.address, false)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(false)
    })

    it('sets permission to false idempotent', async () => {
      await lpKeeper.setCanSubtract(wallet.address, false)
      await lpKeeper.setCanSubtract(wallet.address, false)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(false)
    })

    it('emits event', async () => {
      await expect(lpKeeper.setCanSubtract(other.address, true))
        .to.emit(lpKeeper, 'SetCanSubtract')
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe('#add', () => {
    it('fails if caller is not allowed to add', async () => {
      await expect(lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, other.address, 1)).to.be.reverted
    })

    it('records a new user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      expect(await lpKeeper['isKnownTokenUser(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(true)
      expect(await lpKeeper['totalUsers(string,bytes)'](MOCK_CHAIN, token1.address)).to.eq(1)
    })

    it('does not record a known user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      expect(await lpKeeper['isKnownTokenUser(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(true)
      expect(await lpKeeper['totalUsers(string,bytes)'](MOCK_CHAIN, token1.address)).to.eq(1)
    })

    it('adds to user balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(1)
    })

    it('adds to total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      expect(await lpKeeper['totalBalance(string,bytes)'](MOCK_CHAIN, token1.address)).to.eq(1)
    })

    it('adds each value to total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, other.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, other.address, 1)
      expect(await lpKeeper['totalBalance(string,bytes)'](MOCK_CHAIN, token1.address)).to.eq(2)
    })

    it('emits event', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await expect(lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1))
        .to.emit(lpKeeper, 'Add')
        .withArgs(wallet.address, 0, 0, 1)
    })
  })

  describe('#subtract', () => {
    it('fails if caller is not allowed to subtract', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      await expect(lpKeeper['subtract(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, other.address, 1)).to.be.reverted
    })

    it('subtracts from user balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 2)
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper['subtract(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(1)
    })

    it('subtracts from total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 2)
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper['subtract(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      expect(await lpKeeper['totalBalance(string,bytes)'](MOCK_CHAIN, token1.address)).to.eq(1)
    })

    it('emits event', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 2)
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(lpKeeper['subtract(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1))
        .to.emit(lpKeeper, 'Subtract')
        .withArgs(wallet.address, 0, 0, 1)
    })
  })

  describe('#totalLPTokens', () => {
    it('returns the number of LP tokens', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      expect(await lpKeeper.totalLPTokens()).to.eq(1)
    })

    it('returns the number of LP tokens', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token2.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token2.address, MOCK_CHAIN, wallet.address, 1)
      expect(await lpKeeper.totalLPTokens()).to.eq(2)
    })
  })

  describe('#totalUsers', () => {
    it('returns the number of users for an LP token', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      expect(await lpKeeper['totalUsers(string,bytes)'](MOCK_CHAIN, token1.address)).to.eq(1)
    })

    it('returns the number of users for an LP token', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, other.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, other.address, 1)
      expect(await lpKeeper['totalUsers(string,bytes)'](MOCK_CHAIN, token1.address)).to.eq(2)
    })
  })
})
