import { ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers'
import { TestERC20 } from '../typechain/TestERC20'
import { BalanceEB } from '../typechain/BalanceEB'
import { ImpactEB } from '../typechain/ImpactEB'
import { BalanceKeeper } from '../typechain/BalanceKeeper'
import { MockTimeFarmCurved } from '../typechain/MockTimeFarmCurved'
import { balanceEBFixture } from './shared/fixtures'

import { expect } from './shared/expect'

describe('BalanceEB', () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let farm: MockTimeFarmCurved
  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let impactEB: ImpactEB
  let balanceKeeper: BalanceKeeper
  let balanceEB: BalanceEB
  let userCount: BigNumber

  beforeEach('deploy test contracts', async () => {
    ;({ farm, token0, token1, token2, impactEB, balanceKeeper, balanceEB } = await loadFixture(balanceEBFixture))
    userCount = await impactEB.userCount()
  })

  it('constructor initializes variables', async () => {
    expect(await balanceEB.farm()).to.eq(farm.address)
    expect(await balanceEB.impactEB()).to.eq(impactEB.address)
    expect(await balanceEB.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await balanceEB.totalUsers()).to.eq(userCount)
  })

  it('starting state after deployment', async () => {
    expect(await balanceEB.finalValue()).to.eq(0)
    expect(await balanceEB.lastPortion(wallet.address)).to.eq(0)
    expect(await balanceEB.lastPortion(other.address)).to.eq(0)
  })
  describe('#processBalances', () => {
    it('fails if not allowed to add value', async () => {
      await expect(balanceEB.processBalances(1)).to.be.reverted
    })

    it('adds no value if farm is not started', async () => {
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(1)
      expect(await balanceEB.lastPortion(wallet.address)).to.eq(0)
      expect(await balanceEB.lastPortion(other.address)).to.eq(0)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(0)
      expect(await balanceKeeper.userBalance(other.address)).to.eq(0)
    })

    it('updates final value when step is less than total users', async () => {
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(1)
      expect(await balanceEB.finalValue()).to.eq(1)
    })

    it('does not change final value if step is zero', async () => {
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(1)
      await balanceEB.processBalances(0)
      expect(await balanceEB.finalValue()).to.eq(1)
    })

    it('does not add values if step is zero', async () => {
      await farm.startFarming()
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(0)
      expect(await balanceEB.lastPortion(wallet.address)).to.eq(0)
      expect(await balanceEB.lastPortion(other.address)).to.eq(0)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(0)
      expect(await balanceKeeper.userBalance(other.address)).to.eq(0)
    })

    it('sets final value to zero when step is equal to total users', async () => {
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(2)
      expect(await balanceEB.finalValue()).to.eq(0)
    })

    it('sets final value to zero when step is larger than total users', async () => {
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(3)
      expect(await balanceEB.finalValue()).to.eq(0)
    })

    it('adds value to users if caled once', async () => {
      await farm.startFarming()
      farm.advanceTime(1209600)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(2)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq("91844130687953401335558")
      expect(await balanceKeeper.userBalance(other.address)).to.eq("91844130687953401335558")
    })

    it('adds value to users if caled twice', async () => {
      await farm.startFarming()
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(2)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq("48022336552501505027952")
      expect(await balanceKeeper.userBalance(other.address)).to.eq("48022336552501505027952")
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await balanceEB.processBalances(2)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq("91844130687953401335558")
      expect(await balanceKeeper.userBalance(other.address)).to.eq("91844130687953401335558")
    })

    it('adds value to only one user if step is 1', async () => {
      await farm.startFarming()
      farm.advanceTime(1209600)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(1)
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq("91844130687953401335558")
      expect(await balanceKeeper.userBalance(other.address)).to.eq("0")
    })

    it('updates last portion if caled once', async () => {
      await farm.startFarming()
      farm.advanceTime(1209600)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(2)
      expect(await balanceEB.lastPortion(wallet.address)).to.eq("91844130687953401335558")
      expect(await balanceEB.lastPortion(other.address)).to.eq("91844130687953401335558")
    })

    it('updates last portion if called twice', async () => {
      await farm.startFarming()
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(2)
      expect(await balanceEB.lastPortion(wallet.address)).to.eq("48022336552501505027952")
      expect(await balanceEB.lastPortion(other.address)).to.eq("48022336552501505027952")
      farm.advanceTime(604800)
      await farm.unlockAsset()
      await balanceEB.processBalances(2)
      expect(await balanceEB.lastPortion(wallet.address)).to.eq("91844130687953401335558")
      expect(await balanceEB.lastPortion(other.address)).to.eq("91844130687953401335558")
    })

    it('updates last portion for only one user if step is 1', async () => {
      await farm.startFarming()
      farm.advanceTime(1209600)
      await farm.unlockAsset()
      await balanceKeeper.setCanAdd(balanceEB.address, true)
      await balanceEB.processBalances(1)
      expect(await balanceEB.lastPortion(wallet.address)).to.eq("91844130687953401335558")
      expect(await balanceEB.lastPortion(other.address)).to.eq("0")
    })
  })

})
