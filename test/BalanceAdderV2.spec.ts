import { ethers, waffle } from 'hardhat'
import { expect } from './shared/expect'
import { TestERC20 } from "../typechain/TestERC20"
import { ImpactEB } from "../typechain/ImpactEB"
import { MockTimeFarmCurved } from "../typechain/MockTimeFarmCurved"
import { MockTimeFarmLinear } from "../typechain/MockTimeFarmLinear"
import { BalanceKeeperV2 } from '../typechain/BalanceKeeperV2'
import { LPKeeperV2 } from "../typechain/LPKeeperV2"
import { SharesEB } from "../typechain/SharesEB"
import { SharesLP } from "../typechain/SharesLP"
import { BalanceAdderV2 } from '../typechain/BalanceAdderV2'
import { balanceAdderV2Fixture } from './shared/fixtures'

describe('BalanceAdderV2', () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let farmStaking: MockTimeFarmLinear
  let impactEB: ImpactEB
  let sharesEB: SharesEB
  let farmEB: MockTimeFarmCurved
  let lpKeeper: LPKeeperV2
  let sharesLP1: SharesLP
  let farmLP1: MockTimeFarmLinear
  let sharesLP2: SharesLP
  let farmLP2: MockTimeFarmLinear
  let balanceAdder: BalanceAdderV2

  beforeEach('deploy test contracts', async () => {
    ;({ token0,
        token1,
        token2,
        balanceKeeper,
        farmStaking,
        impactEB,
        sharesEB,
        farmEB,
        lpKeeper,
        sharesLP1,
        farmLP1,
        sharesLP2,
        farmLP2,
        balanceAdder} = await loadFixture(balanceAdderV2Fixture))
  })

  async function farmEBForAWeek() {
    await farmEB.startFarming()
    farmEB.advanceTime(604800)
    await farmEB.unlockAsset()
  }

  it('constructor initializes variables', async () => {
    expect(await balanceAdder.owner()).to.eq(wallet.address)
    expect(await balanceAdder.balanceKeeper()).to.eq(balanceKeeper.address)
  })

  it('starting state after deployment', async () => {
    expect(await balanceAdder.totalUnlocked()).to.eq(0)
    expect(await balanceAdder.lastUser()).to.eq(0)
    expect(await balanceAdder.totalUsers()).to.eq(0)
    expect(await balanceAdder.currentPortion()).to.eq(0)
    expect(await balanceAdder.currentFarm()).to.eq(0)
    await expect(balanceAdder.lastPortions(0)).to.be.reverted
    await expect(balanceAdder.farms(0)).to.be.reverted
    await expect(balanceAdder.shares(0)).to.be.reverted
  })

  describe('#setOwner', () => {
    it('fails if caller is not owner', async () => {
      await expect(balanceAdder.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it('emits a SetOwner event', async () => {
      expect(await balanceAdder.setOwner(other.address))
        .to.emit(balanceAdder, 'SetOwner')
        .withArgs(wallet.address, other.address)
    })

    it('updates owner', async () => {
      await balanceAdder.setOwner(other.address)
      expect(await balanceAdder.owner()).to.eq(other.address)
    })

    it('cannot be called by original owner', async () => {
      await balanceAdder.setOwner(other.address)
      await expect(balanceAdder.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe('#addFarm', () => {
    it('fails if caller is not owner', async () => {
      await expect(balanceAdder.connect(other).addFarm(sharesEB.address, farmEB.address)).to.be.reverted
    })

    it('appends shares', async () => {
      await balanceAdder.addFarm(sharesEB.address, farmEB.address)
      expect(await balanceAdder.shares(0)).to.eq(sharesEB.address)
    })

    it('appends farms', async () => {
      await balanceAdder.addFarm(sharesEB.address, farmEB.address)
      expect(await balanceAdder.farms(0)).to.eq(farmEB.address)
    })

    it('appends last portions', async () => {
      await balanceAdder.addFarm(sharesEB.address, farmEB.address)
      expect(await balanceAdder.lastPortions(0)).to.eq(0)
    })
  })

  describe('#removeFarm', () => {
    it('fails if caller is not owner', async () => {
      await balanceAdder.addFarm(sharesEB.address, farmEB.address)
      await expect(balanceAdder.connect(other).removeFarm(0)).to.be.reverted
    })

    it('removes shares', async () => {
      await balanceAdder.addFarm(sharesEB.address, farmEB.address)
      expect(await balanceAdder.shares(0)).to.eq(sharesEB.address)
      await balanceAdder.removeFarm(0)
      await expect(balanceAdder.shares(0)).to.be.reverted
    })

    it('removes shares', async () => {
      await balanceAdder.addFarm(sharesEB.address, farmEB.address)
      expect(await balanceAdder.shares(0)).to.eq(sharesEB.address)
      await balanceAdder.addFarm(sharesLP1.address, farmLP1.address)
      await balanceAdder.removeFarm(0)
      expect(await balanceAdder.shares(0)).to.eq(sharesLP1.address)
    })

    it('removes farms', async () => {
      await balanceAdder.addFarm(farmEB.address, farmEB.address)
      expect(await balanceAdder.farms(0)).to.eq(farmEB.address)
      await balanceAdder.removeFarm(0)
      await expect(balanceAdder.farms(0)).to.be.reverted
    })

    it('removes farms', async () => {
      await balanceAdder.addFarm(sharesEB.address, farmEB.address)
      expect(await balanceAdder.farms(0)).to.eq(farmEB.address)
      await balanceAdder.addFarm(sharesLP1.address, farmLP1.address)
      await balanceAdder.removeFarm(0)
      expect(await balanceAdder.farms(0)).to.eq(farmLP1.address)
    })

    it('removes last portions', async () => {
      await balanceAdder.addFarm(sharesEB.address, farmEB.address)
      expect(await balanceAdder.lastPortions(0)).to.eq(0)
      await balanceAdder.addFarm(sharesLP1.address, farmLP1.address)
      expect(await balanceAdder.lastPortions(1)).to.eq(0)
      await farmEBForAWeek()
      await (balanceAdder.processBalances(1))
      expect(await balanceAdder.lastPortions(0)).to.eq("96044673105003010055905")
      expect(await balanceAdder.lastPortions(1)).to.eq(0)
      await balanceAdder.removeFarm(0)
      expect(await balanceAdder.lastPortions(0)).to.eq(0)
      await expect(balanceAdder.lastPortions(1)).to.be.reverted
    })
  })

  describe('#processBalances', () => {
  })
})
