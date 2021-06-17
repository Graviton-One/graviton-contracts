import { ethers, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { BalanceKeeperV2 } from '../typechain/BalanceKeeperV2'
import { LPKeeperV2 } from '../typechain/LPKeeperV2'
import { OracleRouterV2 } from '../typechain/OracleRouterV2'
import { oracleRouterV2Fixture } from './shared/fixtures'
import { expect } from './shared/expect'
import { GTON_ADD_TOPIC,
         GTON_SUB_TOPIC,
         __LP_ADD_TOPIC,
         __LP_SUB_TOPIC,
         OTHER_TOPIC,
         MOCK_UUID,
         MOCK_CHAIN } from "./shared/utilities";

describe('OracleRouterV2', () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let lpKeeper: LPKeeperV2
  let oracleRouter: OracleRouterV2

  beforeEach('deploy test contracts', async () => {
    ;({ token0, token1, token2, balanceKeeper, lpKeeper, oracleRouter } = await loadFixture(oracleRouterV2Fixture))
  })

  it('constructor initializes variables', async () => {
    expect(await oracleRouter.owner()).to.eq(wallet.address)
    expect(await oracleRouter.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await oracleRouter.lpKeeper()).to.eq(lpKeeper.address)
    expect(await oracleRouter.gtonAddTopic()).to.eq(GTON_ADD_TOPIC)
    expect(await oracleRouter.gtonSubTopic()).to.eq(GTON_SUB_TOPIC)
    expect(await oracleRouter.__lpAddTopic()).to.eq(__LP_ADD_TOPIC)
    expect(await oracleRouter.__lpSubTopic()).to.eq(__LP_SUB_TOPIC)
  })

  it('starting state after deployment', async () => {
    expect(await oracleRouter.canRoute(wallet.address)).to.eq(false)
    expect(await oracleRouter.canRoute(other.address)).to.eq(false)
  })

  describe('#setCanRoute', () => {
    it('fails if caller is not owner', async () => {
      await expect(oracleRouter.connect(other).setCanRoute(wallet.address, true)).to.be.reverted
    })

    it('sets permission to true', async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      expect(await oracleRouter.canRoute(wallet.address)).to.eq(true)
    })

    it('sets permission to true idempotent', async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.setCanRoute(wallet.address, true)
      expect(await oracleRouter.canRoute(wallet.address)).to.eq(true)
    })

    it('sets permission to false', async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.setCanRoute(wallet.address, false)
      expect(await oracleRouter.canRoute(wallet.address)).to.eq(false)
    })

    it('sets permission to false idempotent', async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.setCanRoute(wallet.address, false)
      await oracleRouter.setCanRoute(wallet.address, false)
      expect(await oracleRouter.canRoute(wallet.address)).to.eq(false)
    })

    it('emits event', async () => {
      await expect(oracleRouter.setCanRoute(other.address, true))
        .to.emit(oracleRouter, 'SetCanRoute')
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe('#setGTONAddTopic', () => {
    it('updates topic', async () => {
      await oracleRouter.setGTONAddTopic(OTHER_TOPIC)
      expect(await oracleRouter.gtonAddTopic()).to.eq(OTHER_TOPIC)
    })
  })

  describe('#setGTONSubTopic', () => {
    it('updates topic', async () => {
      await oracleRouter.setGTONSubTopic(OTHER_TOPIC)
      expect(await oracleRouter.gtonSubTopic()).to.eq(OTHER_TOPIC)
    })
  })

  describe('#__setLPAddTopic', () => {
    it('updates topic', async () => {
      await oracleRouter.__setLPAddTopic(OTHER_TOPIC)
      expect(await oracleRouter.__lpAddTopic()).to.eq(OTHER_TOPIC)
    })
  })

  describe('#__setLPAddTopic', () => {
    it('updates topic', async () => {
      await oracleRouter.__setLPSubTopic(OTHER_TOPIC)
      expect(await oracleRouter.__lpSubTopic()).to.eq(OTHER_TOPIC)
    })
  })

  describe('#routeValue', () => {
    it('fails if caller is not allowed to route', async () => {
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await expect(oracleRouter.connect(other).routeValue(MOCK_UUID
                                                         ,MOCK_CHAIN
                                                         ,other.address
                                                         ,GTON_ADD_TOPIC
                                                         ,token0.address
                                                         ,wallet.address
                                                         ,wallet.address
                                                         ,1000)).to.be.reverted
    })

    it('fails if the router is not allowed to add value', async () => {
      await oracleRouter.setCanRoute(other.address, true)
      await expect(oracleRouter.connect(other).routeValue(MOCK_UUID
                                                         ,MOCK_CHAIN
                                                         ,other.address
                                                         ,GTON_ADD_TOPIC
                                                         ,token0.address
                                                         ,wallet.address
                                                         ,wallet.address
                                                         ,1000)).to.be.reverted
    })

    it('routes to add gton', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.routeValue(MOCK_UUID
                                    ,MOCK_CHAIN
                                    ,other.address
                                    ,GTON_ADD_TOPIC
                                    ,token0.address
                                    ,wallet.address
                                    ,wallet.address
                                    ,1000)
      expect(await balanceKeeper['balance(string,bytes)'](MOCK_CHAIN, wallet.address)).to.eq(1000)
    })

    it('routes to add gton, opens user', async () => {
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.routeValue(MOCK_UUID
                                    ,MOCK_CHAIN
                                    ,other.address
                                    ,GTON_ADD_TOPIC
                                    ,token0.address
                                    ,wallet.address
                                    ,wallet.address
                                    ,1000)
      expect(await balanceKeeper['balance(string,bytes)'](MOCK_CHAIN, wallet.address)).to.eq(1000)
    })

    it('emits event to add gton', async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await expect(oracleRouter.routeValue(MOCK_UUID
                                          ,MOCK_CHAIN
                                          ,other.address
                                          ,GTON_ADD_TOPIC
                                          ,token0.address
                                          ,wallet.address
                                          ,wallet.address
                                           ,1000))
          .to.emit(oracleRouter, 'GTONAdd')
          .withArgs(MOCK_UUID,
                    MOCK_CHAIN,
                    other.address.toLowerCase(),
                    token0.address.toLowerCase(),
                    wallet.address.toLowerCase(),
                    wallet.address.toLowerCase(),
                    1000)
    })

    it('fails if the router is not allowed to subtract value', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper['add(string,bytes,uint256)'](MOCK_CHAIN, wallet.address, 1000)
      await oracleRouter.setCanRoute(wallet.address, true)
      await expect(oracleRouter.routeValue(MOCK_UUID
                                          ,MOCK_CHAIN
                                          ,other.address
                                          ,GTON_SUB_TOPIC
                                          ,token0.address
                                          ,wallet.address
                                          ,wallet.address
                                          ,500)).to.be.reverted
    })

    it('routes to subtract gton', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper['add(string,bytes,uint256)'](MOCK_CHAIN, wallet.address, 1000)
      await balanceKeeper.setCanSubtract(oracleRouter.address, true)
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.routeValue(MOCK_UUID
                                   ,MOCK_CHAIN
                                   ,other.address
                                   ,GTON_SUB_TOPIC
                                   ,token0.address
                                   ,wallet.address
                                   ,wallet.address
                                   ,500)
      expect(await balanceKeeper['balance(string,bytes)'](MOCK_CHAIN, wallet.address)).to.eq(500)
    })

    it('routes event to subtract gton', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper['add(string,bytes,uint256)'](MOCK_CHAIN, wallet.address, 1000)
      await oracleRouter.setCanRoute(wallet.address, true)
      await balanceKeeper.setCanSubtract(oracleRouter.address, true)
      await expect(oracleRouter.routeValue(MOCK_UUID
                                          ,MOCK_CHAIN
                                          ,other.address
                                          ,GTON_SUB_TOPIC
                                          ,token0.address
                                          ,wallet.address
                                          ,wallet.address
                                           ,500))
          .to.emit(oracleRouter, 'GTONSub')
          .withArgs(MOCK_UUID,
                    MOCK_CHAIN,
                    other.address.toLowerCase(),
                    token0.address.toLowerCase(),
                    wallet.address.toLowerCase(),
                    wallet.address.toLowerCase(),
                    500)
    })

    it('fails if the router is not allowed to add lp', async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await expect(oracleRouter.routeValue(MOCK_UUID
                                          ,MOCK_CHAIN
                                          ,other.address
                                          ,__LP_ADD_TOPIC
                                          ,token0.address
                                          ,wallet.address
                                          ,wallet.address
                                          ,500)).to.be.reverted
    })

    it('routes to add lp', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanOpen(oracleRouter.address, true)
      await lpKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.routeValue(MOCK_UUID
                                   ,MOCK_CHAIN
                                   ,other.address
                                   ,__LP_ADD_TOPIC
                                   ,token1.address
                                   ,wallet.address
                                   ,wallet.address
                                   ,1000)
      expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(1000)
    })

    it('routes to add lp, opens user and token', async () => {
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await lpKeeper.setCanOpen(oracleRouter.address, true)
      await lpKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.routeValue(MOCK_UUID
                                   ,MOCK_CHAIN
                                   ,other.address
                                   ,__LP_ADD_TOPIC
                                   ,token1.address
                                   ,wallet.address
                                   ,wallet.address
                                   ,1000)
      expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(1000)
    })

    it('emits event to add lp', async () => {
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await lpKeeper.setCanOpen(oracleRouter.address, true)
      await lpKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.setCanRoute(wallet.address, true)
      await expect(oracleRouter.routeValue(MOCK_UUID
                                          ,MOCK_CHAIN
                                          ,other.address
                                          ,__LP_ADD_TOPIC
                                          ,token1.address
                                          ,wallet.address
                                          ,wallet.address
                                          ,1000))
          .to.emit(oracleRouter, '__LPAdd')
          .withArgs(MOCK_UUID,
                    MOCK_CHAIN,
                    other.address.toLowerCase(),
                    token1.address.toLowerCase(),
                    wallet.address.toLowerCase(),
                    wallet.address.toLowerCase(),
                    1000)
    })

    it('fails if router is not allowed to subtract lp', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1000)
      await oracleRouter.setCanRoute(wallet.address, true)
      await expect(oracleRouter.routeValue(MOCK_UUID
                                          ,MOCK_CHAIN
                                          ,other.address
                                          ,__LP_SUB_TOPIC
                                          ,token1.address
                                          ,wallet.address
                                          ,wallet.address
                                          ,500)).to.be.reverted
    })

    it('routes to subtract lp', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1000)
      await lpKeeper.setCanSubtract(oracleRouter.address, true)
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.routeValue(MOCK_UUID
                                   ,MOCK_CHAIN
                                   ,other.address
                                   ,__LP_SUB_TOPIC
                                   ,token1.address
                                   ,wallet.address
                                   ,wallet.address
                                   ,500)
      expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(500)
    })

    it('emits event to subtract lp', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1000)
      await lpKeeper.setCanSubtract(oracleRouter.address, true)
      await oracleRouter.setCanRoute(wallet.address, true)
      await expect(oracleRouter.routeValue(MOCK_UUID
                                          ,MOCK_CHAIN
                                          ,other.address
                                          ,__LP_SUB_TOPIC
                                          ,token1.address
                                          ,wallet.address
                                          ,wallet.address
                                          ,500))
          .to.emit(oracleRouter, '__LPSub')
          .withArgs(MOCK_UUID,
                    MOCK_CHAIN,
                    other.address.toLowerCase(),
                    token1.address.toLowerCase(),
                    wallet.address.toLowerCase(),
                    wallet.address.toLowerCase(),
                    500)
    })
  })
})
