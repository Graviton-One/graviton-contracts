import { ethers, waffle } from 'hardhat'
import { Contract } from 'ethers'
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
import { MOCK_CHAIN } from './shared/utilities'

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
  let mockFarm1: Contract
  let mockShares1: Contract
  let mockFarm2: Contract
  let mockShares2: Contract

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

    // mock contracts so first processBalances gives 100 to each
    // mock farm always has 1000 unlocked
    const farmABI = ['function totalUnlocked() view returns (uint256)']
    mockFarm1 = await waffle.deployMockContract(wallet, farmABI)
    await mockFarm1.mock.totalUnlocked.returns(1000)
    mockFarm2 = await waffle.deployMockContract(wallet, farmABI)
    await mockFarm2.mock.totalUnlocked.returns(1000)
    // mock shares is always 1/10
    const sharesABI = ['function shareById(uint256) view returns (uint256)',
                       'function totalShares() view returns (uint256)']
    mockShares1 = await waffle.deployMockContract(wallet, sharesABI)
    await mockShares1.mock.shareById.returns(1)
    await mockShares1.mock.totalShares.returns(10)
    mockShares2 = await waffle.deployMockContract(wallet, sharesABI)
    await mockShares2.mock.shareById.returns(1)
    await mockShares2.mock.totalShares.returns(10)
  })

  async function openWallet() {
    await balanceKeeper.setCanOpen(wallet.address, true)
    await balanceKeeper.open(MOCK_CHAIN, wallet.address)
  }
  async function openOther() {
    await balanceKeeper.setCanOpen(wallet.address, true)
    await balanceKeeper.open(MOCK_CHAIN, other.address)
  }
  async function add(user: string, amount: number) {
    await balanceKeeper.setCanAdd(wallet.address, true)
    await balanceKeeper['add(string,bytes,uint256)'](MOCK_CHAIN, user, amount)
  }
  async function subtract(user: string, amount: number) {
    await balanceKeeper.setCanSubtract(wallet.address, true)
    await balanceKeeper['subtract(string,bytes,uint256)'](MOCK_CHAIN, user, amount)
  }
  async function addLP(token: string, user: string, amount: number) {
    await lpKeeper.setCanAdd(wallet.address, true)
    await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token, MOCK_CHAIN, user, amount)
  }
  async function subtractLP(token: string, user: string, amount: number) {
    await lpKeeper.setCanSubtract(wallet.address, true)
    await lpKeeper['subtract(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token, MOCK_CHAIN, user, amount)
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
      await expect(balanceAdder.connect(other).addFarm(mockShares1.address, mockFarm1.address)).to.be.reverted
    })

    it('appends shares', async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address)
      expect(await balanceAdder.shares(0)).to.eq(mockShares1.address)
    })

    it('appends farms', async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address)
      expect(await balanceAdder.farms(0)).to.eq(mockFarm1.address)
    })

    it('appends last portions', async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address)
      expect(await balanceAdder.lastPortions(0)).to.eq(0)
    })
  })

  describe('#removeFarm', () => {
    it('fails if caller is not owner', async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address)
      await expect(balanceAdder.connect(other).removeFarm(0)).to.be.reverted
    })

    it('removes shares', async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address)
      expect(await balanceAdder.shares(0)).to.eq(mockShares1.address)
      await balanceAdder.removeFarm(0)
      await expect(balanceAdder.shares(0)).to.be.reverted
    })

    it('removes shares', async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address)
      expect(await balanceAdder.shares(0)).to.eq(mockShares1.address)
      await balanceAdder.addFarm(mockShares2.address, mockFarm2.address)
      await balanceAdder.removeFarm(0)
      expect(await balanceAdder.shares(0)).to.eq(mockShares2.address)
    })

    it('removes farms', async () => {
      await balanceAdder.addFarm(mockFarm1.address, mockFarm1.address)
      expect(await balanceAdder.farms(0)).to.eq(mockFarm1.address)
      await balanceAdder.removeFarm(0)
      await expect(balanceAdder.farms(0)).to.be.reverted
    })

    it('removes farms', async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address)
      expect(await balanceAdder.farms(0)).to.eq(mockFarm1.address)
      await balanceAdder.addFarm(mockShares2.address, mockFarm2.address)
      await balanceAdder.removeFarm(0)
      expect(await balanceAdder.farms(0)).to.eq(mockFarm2.address)
    })

    it('removes last portions', async () => {
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address)
      expect(await balanceAdder.lastPortions(0)).to.eq(0)
      await balanceAdder.addFarm(mockShares2.address, mockFarm2.address)
      expect(await balanceAdder.lastPortions(1)).to.eq(0)
      await (balanceAdder.processBalances(1))
      expect(await balanceAdder.lastPortions(0)).to.eq("1000")
      expect(await balanceAdder.lastPortions(1)).to.eq(0)
      await balanceAdder.removeFarm(0)
      expect(await balanceAdder.lastPortions(0)).to.eq(0)
      await expect(balanceAdder.lastPortions(1)).to.be.reverted
    })
  })

  describe('#processBalances', () => {
    it('returns without effects if there are no active farms', async () => {
      await openWallet()
      expect(await balanceKeeper['balance(uint256)'](0)).to.eq(0)
      await (balanceAdder.processBalances(1))
      expect(await balanceKeeper['balance(uint256)'](0)).to.eq(0)
    })

    it('fails if not allowed to add value', async () => {
      await openWallet()
      await balanceAdder.addFarm(mockShares1.address, mockFarm1.address)
      await expect(balanceAdder.processBalances(1)).to.be.reverted
    })

    it('updates total users at the start of each loop', async () => {
      await openWallet()
      await add(wallet.address, 1)
      expect(await balanceAdder.totalUsers()).to.eq(0)
      // await balanceAdder.addFarm(sharesStaking.address, farmStaking.address)
      // await balanceKeeper.setCanAdd(balanceAdder.address, true)
      // await balanceAdder.processBalances(1)
      // expect(await balanceAdder.totalUsers()).to.eq(1)
      // await openOther()
      // await balanceAdder.processBalances(1)
      // expect(await balanceAdder.totalUsers()).to.eq(2)
    })

    it('updates total unlocked at the start of each loop', async () => {
    })

    it('updates total current portion at the start of each loop', async () => {
    })

    it('updates final value when step is less than total users', async () => {
    })

    it('does not change final value if step is zero', async () => {
    })

    it('sets final value to zero when step is equal to total users', async () => {
    })

    it('sets final value to zero when step is larger than total users', async () => {
    })

    describe('#EB', () => {
      it('does not add values if farm is not started', async () => {
      })

      it('does not add values if step is zero', async () => {
      })

      it('adds value to only one user if step is 1', async () => {
      })

      it('adds value to users', async () => {
      })

      it('updates last portion', async () => {
      })
    })

    describe('#LP', () => {
      it('does not add values if farm is not started', async () => {
      })

      it('does not add values if step is zero', async () => {
      })

      it('adds value to only one user if step is 1', async () => {
      })

      it('adds value to users', async () => {
      })

      it('updates last portion', async () => {
      })
    })

    describe('#Staking', () => {
      it('does not add values if farm is not started', async () => {
      })

      it('does not add values if step is zero', async () => {
      })

      it('adds value to only one user if step is 1', async () => {
      })

      it('adds value to users', async () => {
      })

      it('updates last portion', async () => {
      })
    })
  })
})
