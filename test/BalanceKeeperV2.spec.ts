import { ethers, waffle } from 'hardhat'
import { BalanceKeeperV2 } from '../typechain/BalanceKeeperV2'
import { expect } from './shared/expect'

describe('BalanceKeeperV2', () => {
  const [wallet, other] = waffle.provider.getWallets()

  let balanceKeeper: BalanceKeeperV2

  const fixture = async () => {
    const balanceKeeperFactory = await ethers.getContractFactory('BalanceKeeperV2')
    return (await balanceKeeperFactory.deploy(wallet.address)) as BalanceKeeperV2
  }

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  beforeEach('deploy test contracts', async () => {
    balanceKeeper = await loadFixture(fixture)
  })

  it('constructor initializes variables', async () => {
    expect(await balanceKeeper.owner()).to.eq(wallet.address)
  })

  it('starting state after deployment', async () => {
    expect(await balanceKeeper.totalBalance()).to.eq(0)
    expect(await balanceKeeper.totalUsers()).to.eq(0)
    expect(await balanceKeeper.balanceById(0)).to.eq(0)
    expect(await balanceKeeper.balanceById(1)).to.eq(0)
    expect(await balanceKeeper.idByChainAddress("ETH", wallet.address)).to.eq(0)
    expect(await balanceKeeper.idByChainAddress("ETH", other.address)).to.eq(0)
    // expect(await balanceKeeper.chainAddressById(0)).to.eq(['',''])
    expect(await balanceKeeper.chainById(0)).to.eq("")
    expect(await balanceKeeper.addressById(0)).to.eq("")
    expect(await balanceKeeper.canAdd(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canAdd(other.address)).to.eq(false)
    expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canSubtract(other.address)).to.eq(false)
    expect(await balanceKeeper.canOpen(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canOpen(other.address)).to.eq(false)
  })

  describe('#setOwner', () => {
    it('fails if caller is not owner', async () => {
      await expect(balanceKeeper.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it('emits a SetOwner event', async () => {
      expect(await balanceKeeper.setOwner(other.address))
        .to.emit(balanceKeeper, 'SetOwner')
        .withArgs(wallet.address, other.address)
    })

    it('updates owner', async () => {
      await balanceKeeper.setOwner(other.address)
      expect(await balanceKeeper.owner()).to.eq(other.address)
    })

    it('cannot be called by original owner', async () => {
      await balanceKeeper.setOwner(other.address)
      await expect(balanceKeeper.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe('#totalUsers', () => {
    it('returns the number of users', async () => {
      expect(await balanceKeeper.totalUsers()).to.eq(0)
    })
  })

  describe('#setCanAdd', () => {
    it('fails if caller is not owner', async () => {
      await expect(balanceKeeper.connect(other).setCanAdd(wallet.address, true)).to.be.reverted
    })

    it('sets permission to true', async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      expect(await balanceKeeper.canAdd(wallet.address)).to.eq(true)
    })

    it('sets permission to true idempotent', async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.setCanAdd(wallet.address, true)
      expect(await balanceKeeper.canAdd(wallet.address)).to.eq(true)
    })

    it('sets permission to false', async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.setCanAdd(wallet.address, false)
      expect(await balanceKeeper.canAdd(wallet.address)).to.eq(false)
    })

    it('sets permission to false idempotent', async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.setCanAdd(wallet.address, false)
      await balanceKeeper.setCanAdd(wallet.address, false)
      expect(await balanceKeeper.canAdd(wallet.address)).to.eq(false)
    })

    it('emits event', async () => {
      await expect(balanceKeeper.setCanAdd(other.address, true))
        .to.emit(balanceKeeper, 'SetCanAdd')
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe('#setCanSubtract', () => {
    it('fails if caller is not owner', async () => {
      await expect(balanceKeeper.connect(other).setCanSubtract(wallet.address, true)).to.be.reverted
    })

    it('sets permission to true', async () => {
      await balanceKeeper.setCanSubtract(wallet.address, true)
      expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(true)
    })

    it('sets permission to true idempotent', async () => {
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(true)
    })

    it('sets permission to false', async () => {
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.setCanSubtract(wallet.address, false)
      expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(false)
    })

    it('sets permission to false idempotent', async () => {
      await balanceKeeper.setCanSubtract(wallet.address, false)
      await balanceKeeper.setCanSubtract(wallet.address, false)
      expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(false)
    })

    it('emits event', async () => {
      await expect(balanceKeeper.setCanSubtract(other.address, true))
        .to.emit(balanceKeeper, 'SetCanSubtract')
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe('#setCanOpen', () => {
    it('fails if caller is not owner', async () => {
      await expect(balanceKeeper.connect(other).setCanOpen(wallet.address, true)).to.be.reverted
    })

    it('sets permission to true', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      expect(await balanceKeeper.canOpen(wallet.address)).to.eq(true)
    })

    it('sets permission to true idempotent', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.setCanOpen(wallet.address, true)
      expect(await balanceKeeper.canOpen(wallet.address)).to.eq(true)
    })

    it('sets permission to false', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.setCanOpen(wallet.address, false)
      expect(await balanceKeeper.canOpen(wallet.address)).to.eq(false)
    })

    it('sets permission to false idempotent', async () => {
      await balanceKeeper.setCanOpen(wallet.address, false)
      await balanceKeeper.setCanOpen(wallet.address, false)
      expect(await balanceKeeper.canOpen(wallet.address)).to.eq(false)
    })

    it('emits event', async () => {
      await expect(balanceKeeper.setCanOpen(other.address, true))
        .to.emit(balanceKeeper, 'SetCanOpen')
        .withArgs(wallet.address, other.address, true)
    })
  })

})
