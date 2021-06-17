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

  describe('#EB', () => {
  })

  describe('#LP', () => {
  })

  describe('#Staking', () => {
  })

  describe('#EB->Staking', () => {
  })

  describe('#LP->Staking', () => {
  })

  describe('#EB->LP->Staking', () => {
  })
})
