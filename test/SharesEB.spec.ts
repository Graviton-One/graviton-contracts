import { ethers, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { SharesEB } from '../typechain/SharesEB'
import { ImpactEB } from '../typechain/ImpactEB'
import { BalanceKeeperV2 } from '../typechain/BalanceKeeperV2'
import { sharesEBFixture } from './shared/fixtures'
import { makeValueImpact } from './shared/utilities'

import { expect } from './shared/expect'

describe('SharesEB', () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let impactEB: ImpactEB
  let balanceKeeper: BalanceKeeperV2
  let sharesEB: SharesEB

  beforeEach('deploy test contracts', async () => {
    ;({ token0, token1, token2, impactEB, balanceKeeper, sharesEB } = await loadFixture(sharesEBFixture))
  })

  it('constructor initializes variables', async () => {
    expect(await sharesEB.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await sharesEB.impactEB()).to.eq(impactEB.address)
  })

  it('constructor fails if token is not known', async () => {
    expect(await sharesEB.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await sharesEB.impactEB()).to.eq(impactEB.address)
  })

  describe('#shareByid', () => {
    it('returns 0 if user is not known', async () => {
      expect(await sharesEB.shareById(0)).to.eq(0)
    })

    it('returns 0 if user chain is not EVM', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open("WRONG_CHAIN", wallet.address)
      expect(await sharesEB.shareById(0)).to.eq(0)
    })

    it('returns 0 if user address is not valid length', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open("EVM", "0x000f")
      expect(await sharesEB.shareById(0)).to.eq(0)
    })

    it('returns 0 if user has no impact', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open("EVM", wallet.address)
      expect(await sharesEB.shareById(0)).to.eq(0)
    })

    it('returns user impact', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open("EVM", wallet.address)
      await impactEB
        .connect(nebula)
        .attachValue(makeValueImpact(token1.address, wallet.address, "1000", "0", "0"));
      expect(await sharesEB.shareById(0)).to.eq(1000)
    })
  })

  describe('#totalShares', () => {
    it('returns total impact', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open("EVM", wallet.address)
      await balanceKeeper.open("EVM", other.address)
      await impactEB
        .connect(nebula)
        .attachValue(makeValueImpact(token1.address, wallet.address, "1000", "0", "0"));
      await impactEB
        .connect(nebula)
        .attachValue(makeValueImpact(token1.address, other.address, "1000", "1", "0"));
      expect(await sharesEB.totalShares()).to.eq(2000)
    })
  })
})
