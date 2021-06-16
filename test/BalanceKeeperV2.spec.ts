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
    expect(await balanceKeeper.canAdd(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canAdd(other.address)).to.eq(false)
    expect(await balanceKeeper.canSubtract(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canSubtract(other.address)).to.eq(false)
    expect(await balanceKeeper.canOpen(wallet.address)).to.eq(false)
    expect(await balanceKeeper.canOpen(other.address)).to.eq(false)
    expect(await balanceKeeper.totalUsers()).to.eq(0)
    expect(await balanceKeeper.totalBalance()).to.eq(0)
    expect(await balanceKeeper.balanceById(0)).to.eq(0)
    expect(await balanceKeeper.balanceById(1)).to.eq(0)
    expect(await balanceKeeper.balanceByChainAddress("EVM", wallet.address)).to.eq(0)
    expect(await balanceKeeper.balanceByChainAddress("EVM", other.address)).to.eq(0)
    await expect(balanceKeeper.idByChainAddress("EVM", wallet.address)).to.be.reverted
    await expect(balanceKeeper.idByChainAddress("EVM", other.address)).to.be.reverted
    await expect(balanceKeeper.chainById(0)).to.be.reverted
    await expect(balanceKeeper.addressById(0)).to.be.reverted
    await expect(balanceKeeper.chainAddressById(0)).to.be.reverted
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

  describe('#isKnownId', () => {
    it('returns false for the user that is not known', async () => {
      expect(await balanceKeeper.isKnownId(0)).to.eq(false)
    })

    it('returns true for the known user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.isKnownId(0)).to.eq(true)
    })
  })

  describe('#isKnownChainAddress', () => {
    it('returns false for the user that is not known', async () => {
      expect(await balanceKeeper.isKnownChainAddress("EVM", wallet.address)).to.eq(false)
    })

    it('returns true for the known user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.isKnownChainAddress("EVM", wallet.address)).to.eq(true)
    })
  })

  describe('#chainById', () => {
    it('fails for the user that is not known', async () => {
      await expect(balanceKeeper.chainById(0)).to.be.reverted
    })

    it('returns chain for the known user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.chainById(0)).to.eq("EVM")
    })
  })

  describe('#addressById', () => {
    it('fails for the user that is not known', async () => {
      await expect(balanceKeeper.addressById(0)).to.be.reverted
    })

    it('returns address for the known user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.addressById(0)).to.eq(wallet.address.toLowerCase())
    })
  })

  describe('#chainAddressById', () => {
    it('fails for the user that is not known', async () => {
      await expect(balanceKeeper.chainById(0)).to.be.reverted
    })

    it('returns chain and address for the known user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      let chainAddress = await balanceKeeper.chainAddressById(0)
      expect(chainAddress[0]).to.eq("EVM")
      expect(chainAddress[1]).to.eq(wallet.address.toLowerCase())
    })
  })

  describe('#idByChainAddress', () => {
    it('fails for the user that is not known', async () => {
      await expect(balanceKeeper.idByChainAddress("EVM", wallet.address)).to.be.reverted
    })

    it('returns id for the known user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.idByChainAddress("EVM", wallet.address)).to.eq(0)
    })
  })

  describe('#balanceById', () => {
    it('returns 0 for the user that is not known', async () => {
      expect(await balanceKeeper.balanceById(0)).to.eq(0)
    })

    it('returns 0 when the balance is empty', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.balanceById(0)).to.eq(0)
    })

    it('returns balance for the known user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addByChainAddress("EVM", wallet.address, 100)
      expect(await balanceKeeper.balanceById(0)).to.eq(100)
    })
  })

  describe('#balanceByChainAddress', () => {
    it('returns 0 for the user that is not known', async () => {
      expect(await balanceKeeper.balanceByChainAddress("EVM", wallet.address)).to.eq(0)
    })

    it('returns 0 when the balance is empty', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.balanceByChainAddress("EVM", wallet.address)).to.eq(0)
    })

    it('returns balance for the known user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addByChainAddress("EVM", wallet.address, 100)
      expect(await balanceKeeper.balanceByChainAddress("EVM", wallet.address)).to.eq(100)
    })
  })

  describe('#openId', () => {
    it('fails if caller is not allowed to open', async () => {
      await expect(balanceKeeper.openId("EVM", wallet.address)).to.be.reverted
    })

    it('sets chain for id', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.chainById(0)).to.eq("EVM")
    })

    it('sets address for id', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.addressById(0)).to.eq(wallet.address.toLowerCase())
    })

    it('sets id for chain and address', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      let chainAddress = await balanceKeeper.chainAddressById(0)
      expect(chainAddress[0]).to.eq("EVM")
      expect(chainAddress[1]).to.eq(wallet.address.toLowerCase())
    })

    it('increments the number of users for the chain and address that are not known', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.totalUsers()).to.eq(1)
    })

    it('increments the number of users for the chain and address that are not known', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.openId("EVM", other.address)
      expect(await balanceKeeper.totalUsers()).to.eq(2)
    })

    it('does not increment the number of users for the known chain and address', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.openId("EVM", wallet.address)
      expect(await balanceKeeper.totalUsers()).to.eq(1)
    })

    it('does not increment the number of users for the same address in upper and lower case', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.openId("EVM", wallet.address.toLowerCase())
      expect(await balanceKeeper.totalUsers()).to.eq(1)
    })
  })

  describe('#addById', () => {
    it('fails if caller is not allowed to add', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await expect(balanceKeeper.addById(0, 1)).to.be.reverted
    })

    it('fails if the id is not known', async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await expect(balanceKeeper.addById(0, 1)).to.be.reverted
    })

    it('adds amount to user balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      expect(await balanceKeeper.balanceById(0)).to.eq(100)
    })

    it('adds amount to total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      expect(await balanceKeeper.totalBalance()).to.eq(100)
    })

    it('adds amount to total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      await balanceKeeper.openId("EVM", other.address)
      await balanceKeeper.addById(1, 100)
      expect(await balanceKeeper.totalBalance()).to.eq(200)
    })
  })

  describe('#addByChainAddress', () => {
    it('fails if caller is not allowed to add', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await expect(balanceKeeper.addByChainAddress("EVM", wallet.address, 100)).to.be.reverted
    })

    it('fails if the chain and address are not known', async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await expect(balanceKeeper.addByChainAddress("EVM", wallet.address, 100)).to.be.reverted
    })

    it('adds amount to user balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addByChainAddress("EVM", wallet.address, 100)
      expect(await balanceKeeper.balanceById(0)).to.eq(100)
    })

    it('adds amount to total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addByChainAddress("EVM", wallet.address, 100)
      expect(await balanceKeeper.totalBalance()).to.eq(100)
    })

    it('adds amount to total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addByChainAddress("EVM", wallet.address, 100)
      await balanceKeeper.openId("EVM", other.address)
      await balanceKeeper.addByChainAddress("EVM", other.address, 100)
      expect(await balanceKeeper.totalBalance()).to.eq(200)
    })
  })

  describe('#subtractById', () => {
    it('fails if caller is not allowed to add', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      await expect(balanceKeeper.subtractById(0, 50)).to.be.reverted
    })

    it('fails if the id is not known', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await expect(balanceKeeper.subtractById(0, 0)).to.be.reverted
    })

    it('subtracts amount from user balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.subtractById(0, 50)
      expect(await balanceKeeper.balanceById(0)).to.eq(50)
    })

    it('subtracts amount from total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.subtractById(0, 50)
      expect(await balanceKeeper.totalBalance()).to.eq(50)
    })

    it('subtracts amount from total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      await balanceKeeper.openId("EVM", other.address)
      await balanceKeeper.addById(1, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.subtractById(0, 50)
      await balanceKeeper.subtractById(1, 75)
      expect(await balanceKeeper.totalBalance()).to.eq(75)
    })
  })

  describe('#subtractByChainAddress', () => {
    it('fails if caller is not allowed to add', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      await expect(balanceKeeper.subtractByChainAddress("EVM", wallet.address, 100)).to.be.reverted
    })

    it('fails if the chain and address are not known', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await expect(balanceKeeper.subtractByChainAddress("EVM", wallet.address, 0)).to.be.reverted
    })

    it('subtracts amount from user', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.subtractByChainAddress("EVM", wallet.address, 50)
      expect(await balanceKeeper.balanceById(0)).to.eq(50)
    })

    it('subtracts amount from total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.subtractByChainAddress("EVM", wallet.address, 50)
      expect(await balanceKeeper.totalBalance()).to.eq(50)
    })

    it('subtracts amount from total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      await balanceKeeper.openId("EVM", other.address)
      await balanceKeeper.addById(1, 100)
      await balanceKeeper.setCanSubtract(wallet.address, true)
      await balanceKeeper.subtractByChainAddress("EVM", wallet.address, 50)
      await balanceKeeper.subtractByChainAddress("EVM", other.address, 75)
      expect(await balanceKeeper.totalBalance()).to.eq(75)
    })
  })

  describe('#getShareById', () => {
    it('returns user balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      expect(await balanceKeeper.getShareById(0)).to.eq(100)
    })
  })

  describe('#getShareById', () => {
    it('returns total balance', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.openId("EVM", wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.addById(0, 100)
      await balanceKeeper.openId("EVM", other.address)
      await balanceKeeper.addById(1, 100)
      expect(await balanceKeeper.getTotal()).to.eq(200)
    })
  })
})
