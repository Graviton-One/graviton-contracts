import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { BalanceKeeper } from "../typechain/BalanceKeeper"
import { LPKeeper } from "../typechain/LPKeeper"
import { OracleRouter } from "../typechain/OracleRouter"
import { oracleRouterFixture } from "./shared/fixtures"
import { expect } from "./shared/expect"
import {
  GTON_ADD_TOPIC,
  GTON_SUB_TOPIC,
  LP_ADD_TOPIC,
  LP_SUB_TOPIC,
  OTHER_TOPIC,
  MOCK_UUID,
  EVM_CHAIN,
} from "./shared/utilities"

describe("OracleRouter", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeper
  let lpKeeper: LPKeeper
  let oracleRouter: OracleRouter

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, balanceKeeper, lpKeeper, oracleRouter } =
      await loadFixture(oracleRouterFixture))
  })

  it("constructor initializes variables", async () => {
    expect(await oracleRouter.owner()).to.eq(wallet.address)
    expect(await oracleRouter.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await oracleRouter.lpKeeper()).to.eq(lpKeeper.address)
    expect(await oracleRouter.gtonAddTopic()).to.eq(GTON_ADD_TOPIC)
    expect(await oracleRouter.gtonSubTopic()).to.eq(GTON_SUB_TOPIC)
    expect(await oracleRouter.lpAddTopic()).to.eq(LP_ADD_TOPIC)
    expect(await oracleRouter.lpSubTopic()).to.eq(LP_SUB_TOPIC)
  })

  it("starting state after deployment", async () => {
    expect(await oracleRouter.canRoute(wallet.address)).to.eq(false)
    expect(await oracleRouter.canRoute(other.address)).to.eq(false)
  })

  describe("#setCanRoute", () => {
    it("fails if caller is not owner", async () => {
      await expect(
        oracleRouter.connect(other).setCanRoute(wallet.address, true)
      ).to.be.reverted
    })

    it("sets permission to true", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      expect(await oracleRouter.canRoute(wallet.address)).to.eq(true)
    })

    it("sets permission to true idempotent", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.setCanRoute(wallet.address, true)
      expect(await oracleRouter.canRoute(wallet.address)).to.eq(true)
    })

    it("sets permission to false", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.setCanRoute(wallet.address, false)
      expect(await oracleRouter.canRoute(wallet.address)).to.eq(false)
    })

    it("sets permission to false idempotent", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await oracleRouter.setCanRoute(wallet.address, false)
      await oracleRouter.setCanRoute(wallet.address, false)
      expect(await oracleRouter.canRoute(wallet.address)).to.eq(false)
    })

    it("emits event", async () => {
      await expect(oracleRouter.setCanRoute(other.address, true))
        .to.emit(oracleRouter, "SetCanRoute")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#setGTONAddTopic", () => {
    it("updates topic", async () => {
      await oracleRouter.setGTONAddTopic(OTHER_TOPIC)
      expect(await oracleRouter.gtonAddTopic()).to.eq(OTHER_TOPIC)
    })
  })

  describe("#setGTONSubTopic", () => {
    it("updates topic", async () => {
      await oracleRouter.setGTONSubTopic(OTHER_TOPIC)
      expect(await oracleRouter.gtonSubTopic()).to.eq(OTHER_TOPIC)
    })
  })

  describe("#setLPAddTopic", () => {
    it("updates topic", async () => {
      await oracleRouter.setLPAddTopic(OTHER_TOPIC)
      expect(await oracleRouter.lpAddTopic()).to.eq(OTHER_TOPIC)
    })
  })

  describe("#setLPAddTopic", () => {
    it("updates topic", async () => {
      await oracleRouter.setLPSubTopic(OTHER_TOPIC)
      expect(await oracleRouter.lpSubTopic()).to.eq(OTHER_TOPIC)
    })
  })

  describe("#routeValue", () => {
    it("fails if caller is not allowed to route", async () => {
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await expect(
        oracleRouter
          .connect(other)
          .routeValue(
            MOCK_UUID,
            EVM_CHAIN,
            other.address,
            GTON_ADD_TOPIC,
            token0.address,
            wallet.address,
            wallet.address,
            1000
          )
      ).to.be.reverted
    })

    it("fails if the router is not allowed to add value", async () => {
      await oracleRouter.setCanRoute(other.address, true)
      await expect(
        oracleRouter
          .connect(other)
          .routeValue(
            MOCK_UUID,
            EVM_CHAIN,
            other.address,
            GTON_ADD_TOPIC,
            token0.address,
            wallet.address,
            wallet.address,
            1000
          )
      ).to.be.reverted
    })

    it("routes to add gton", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.routeValue(
        MOCK_UUID,
        EVM_CHAIN,
        other.address,
        GTON_ADD_TOPIC,
        token0.address,
        wallet.address,
        wallet.address,
        1000
      )
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(1000)
    })

    it("emits event to add gton", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await expect(
        oracleRouter.routeValue(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          GTON_ADD_TOPIC,
          token0.address,
          wallet.address,
          wallet.address,
          1000
        )
      )
        .to.emit(oracleRouter, "GTONAdd")
        .withArgs(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          token0.address,
          wallet.address,
          wallet.address,
          1000
        )
    })

    it("fails if the router is not allowed to subtract value", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 1000)
      await oracleRouter.setCanRoute(wallet.address, true)
      await expect(
        oracleRouter.routeValue(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          GTON_SUB_TOPIC,
          token0.address,
          wallet.address,
          wallet.address,
          500
        )
      ).to.be.reverted
    })

    it("routes to subtract gton", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 1000)
      await oracleRouter.setCanRoute(wallet.address, true)
      await balanceKeeper.setCanSubtract(oracleRouter.address, true)
      await oracleRouter.routeValue(
        MOCK_UUID,
        EVM_CHAIN,
        other.address,
        GTON_SUB_TOPIC,
        token0.address,
        wallet.address,
        wallet.address,
        500
      )
      expect(await balanceKeeper.userBalance(wallet.address)).to.eq(500)
    })

    it("routes event to subtract gton", async () => {
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper.add(wallet.address, 1000)
      await oracleRouter.setCanRoute(wallet.address, true)
      await balanceKeeper.setCanSubtract(oracleRouter.address, true)
      await expect(
        oracleRouter.routeValue(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          GTON_SUB_TOPIC,
          token0.address,
          wallet.address,
          wallet.address,
          500
        )
      )
        .to.emit(oracleRouter, "GTONSub")
        .withArgs(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          token0.address,
          wallet.address,
          wallet.address,
          500
        )
    })

    it("fails if the router is not allowed to add lp", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await expect(
        oracleRouter.routeValue(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          LP_ADD_TOPIC,
          token0.address,
          wallet.address,
          wallet.address,
          500
        )
      ).to.be.reverted
    })

    it("routes to add lp", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await lpKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.routeValue(
        MOCK_UUID,
        EVM_CHAIN,
        other.address,
        LP_ADD_TOPIC,
        token1.address,
        wallet.address,
        wallet.address,
        1000
      )
      expect(await lpKeeper.userBalance(token1.address, wallet.address)).to.eq(
        1000
      )
    })

    it("emits event to add lp", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await lpKeeper.setCanAdd(oracleRouter.address, true)
      await expect(
        oracleRouter.routeValue(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          LP_ADD_TOPIC,
          token1.address,
          wallet.address,
          wallet.address,
          1000
        )
      )
        .to.emit(oracleRouter, "LPAdd")
        .withArgs(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          token1.address,
          wallet.address,
          wallet.address,
          1000
        )
    })

    it("fails if router is not allowed to subtract lp", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, wallet.address, 1000)
      await expect(
        oracleRouter.routeValue(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          LP_SUB_TOPIC,
          token1.address,
          wallet.address,
          wallet.address,
          500
        )
      ).to.be.reverted
    })

    it("routes to subtract lp", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, wallet.address, 1000)
      await lpKeeper.setCanSubtract(oracleRouter.address, true)
      await oracleRouter.routeValue(
        MOCK_UUID,
        EVM_CHAIN,
        other.address,
        LP_SUB_TOPIC,
        token1.address,
        wallet.address,
        wallet.address,
        500
      )
      expect(await lpKeeper.userBalance(token1.address, wallet.address)).to.eq(
        500
      )
    })

    it("emits event to subtract lp", async () => {
      await oracleRouter.setCanRoute(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.add(token1.address, wallet.address, 1000)
      await lpKeeper.setCanSubtract(oracleRouter.address, true)
      await expect(
        oracleRouter.routeValue(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          LP_SUB_TOPIC,
          token1.address,
          wallet.address,
          wallet.address,
          500
        )
      )
        .to.emit(oracleRouter, "LPSub")
        .withArgs(
          MOCK_UUID,
          EVM_CHAIN,
          other.address,
          token1.address,
          wallet.address,
          wallet.address,
          500
        )
    })
  })
})
