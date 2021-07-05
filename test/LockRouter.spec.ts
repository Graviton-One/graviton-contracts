import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { BalanceKeeperV2 } from "../typechain/BalanceKeeperV2"
import { LPKeeperV2 } from "../typechain/LPKeeperV2"
import { LockRouter } from "../typechain/LockRouter"
import { lockRouterFixture } from "./shared/fixtures"
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

describe("LockRouter", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let lpKeeper: LPKeeperV2
  let lockRouter: LockRouter

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, balanceKeeper, lpKeeper, lockRouter } =
      await loadFixture(lockRouterFixture))
  })

  it("constructor initializes variables", async () => {
    expect(await lockRouter.owner()).to.eq(wallet.address)
    expect(await lockRouter.balanceKeeper()).to.eq(balanceKeeper.address)
    expect(await lockRouter.lpKeeper()).to.eq(lpKeeper.address)
    expect(await lockRouter.gtonAddTopic()).to.eq(GTON_ADD_TOPIC)
    expect(await lockRouter.gtonSubTopic()).to.eq(GTON_SUB_TOPIC)
    expect(await lockRouter.lpAddTopic()).to.eq(LP_ADD_TOPIC)
    expect(await lockRouter.lpSubTopic()).to.eq(LP_SUB_TOPIC)
  })

  it("starting state after deployment", async () => {
    expect(await lockRouter.canRoute(wallet.address)).to.eq(false)
    expect(await lockRouter.canRoute(other.address)).to.eq(false)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(lockRouter.connect(other).setOwner(wallet.address)).to.be
        .reverted
    })

    it("emits a SetOwner event", async () => {
      expect(await lockRouter.setOwner(other.address))
        .to.emit(lockRouter, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await lockRouter.setOwner(other.address)
      expect(await lockRouter.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await lockRouter.setOwner(other.address)
      await expect(lockRouter.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#setCanRoute", () => {
    it("fails if caller is not owner", async () => {
      await expect(
        lockRouter.connect(other).setCanRoute(wallet.address, true)
      ).to.be.reverted
    })

    it("sets permission to true", async () => {
      await lockRouter.setCanRoute(wallet.address, true)
      expect(await lockRouter.canRoute(wallet.address)).to.eq(true)
    })

    it("sets permission to true idempotent", async () => {
      await lockRouter.setCanRoute(wallet.address, true)
      await lockRouter.setCanRoute(wallet.address, true)
      expect(await lockRouter.canRoute(wallet.address)).to.eq(true)
    })

    it("sets permission to false", async () => {
      await lockRouter.setCanRoute(wallet.address, true)
      await lockRouter.setCanRoute(wallet.address, false)
      expect(await lockRouter.canRoute(wallet.address)).to.eq(false)
    })

    it("sets permission to false idempotent", async () => {
      await lockRouter.setCanRoute(wallet.address, true)
      await lockRouter.setCanRoute(wallet.address, false)
      await lockRouter.setCanRoute(wallet.address, false)
      expect(await lockRouter.canRoute(wallet.address)).to.eq(false)
    })

    it("emits event", async () => {
      await expect(lockRouter.setCanRoute(other.address, true))
        .to.emit(lockRouter, "SetCanRoute")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#setGTONAddTopic", () => {
    it("updates topic", async () => {
      await lockRouter.setGTONAddTopic(OTHER_TOPIC)
      expect(await lockRouter.gtonAddTopic()).to.eq(OTHER_TOPIC)
    })

    it("emits event", async () => {
      await expect(lockRouter.setGTONAddTopic(OTHER_TOPIC))
        .to.emit(lockRouter, "SetGTONAddTopic")
        .withArgs(GTON_ADD_TOPIC, OTHER_TOPIC)
    })
  })

  describe("#setGTONSubTopic", () => {
    it("updates topic", async () => {
      await lockRouter.setGTONSubTopic(OTHER_TOPIC)
      expect(await lockRouter.gtonSubTopic()).to.eq(OTHER_TOPIC)
    })

    it("emits event", async () => {
      await expect(lockRouter.setGTONSubTopic(OTHER_TOPIC))
        .to.emit(lockRouter, "SetGTONSubTopic")
        .withArgs(GTON_SUB_TOPIC, OTHER_TOPIC)
    })
  })

  describe("#setLPAddTopic", () => {
    it("updates topic", async () => {
      await lockRouter.setLPAddTopic(OTHER_TOPIC)
      expect(await lockRouter.lpAddTopic()).to.eq(OTHER_TOPIC)
    })

    it("emits event", async () => {
      await expect(lockRouter.setLPAddTopic(OTHER_TOPIC))
        .to.emit(lockRouter, "SetLPAddTopic")
        .withArgs(LP_ADD_TOPIC, OTHER_TOPIC)
    })
  })

  describe("#setLPAddTopic", () => {
    it("updates topic", async () => {
      await lockRouter.setLPSubTopic(OTHER_TOPIC)
      expect(await lockRouter.lpSubTopic()).to.eq(OTHER_TOPIC)
    })

    it("emits event", async () => {
      await expect(lockRouter.setLPSubTopic(OTHER_TOPIC))
        .to.emit(lockRouter, "SetLPSubTopic")
        .withArgs(LP_SUB_TOPIC, OTHER_TOPIC)
    })
  })

  describe("#routeValue", () => {
    it("fails if caller is not allowed to route", async () => {
      await balanceKeeper.setCanAdd(lockRouter.address, true)
      await balanceKeeper.setCanOpen(lockRouter.address, true)
      await expect(
        lockRouter
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
      await lockRouter.setCanRoute(other.address, true)
      await expect(
        lockRouter
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
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.setCanAdd(lockRouter.address, true)
      await balanceKeeper.setCanOpen(lockRouter.address, true)
      await lockRouter.setCanRoute(wallet.address, true)
      await lockRouter.routeValue(
        MOCK_UUID,
        EVM_CHAIN,
        other.address,
        GTON_ADD_TOPIC,
        token0.address,
        wallet.address,
        wallet.address,
        1000
      )
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(1000)
    })

    it("routes to add gton, opens user", async () => {
      await balanceKeeper.setCanAdd(lockRouter.address, true)
      await balanceKeeper.setCanOpen(lockRouter.address, true)
      await lockRouter.setCanRoute(wallet.address, true)
      await lockRouter.routeValue(
        MOCK_UUID,
        EVM_CHAIN,
        other.address,
        GTON_ADD_TOPIC,
        token0.address,
        wallet.address,
        wallet.address,
        1000
      )
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(1000)
    })

    it("emits event to add gton", async () => {
      await lockRouter.setCanRoute(wallet.address, true)
      await balanceKeeper.setCanAdd(lockRouter.address, true)
      await balanceKeeper.setCanOpen(lockRouter.address, true)
      await expect(
        lockRouter.routeValue(
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
        .to.emit(lockRouter, "GTONAdd")
        .withArgs(
          MOCK_UUID,
          EVM_CHAIN,
          other.address.toLowerCase(),
          token0.address.toLowerCase(),
          wallet.address.toLowerCase(),
          wallet.address.toLowerCase(),
          1000
        )
    })

    it("fails if the router is not allowed to subtract value", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        1000
      )
      await lockRouter.setCanRoute(wallet.address, true)
      await expect(
        lockRouter.routeValue(
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
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        1000
      )
      await balanceKeeper.setCanSubtract(lockRouter.address, true)
      await lockRouter.setCanRoute(wallet.address, true)
      await lockRouter.routeValue(
        MOCK_UUID,
        EVM_CHAIN,
        other.address,
        GTON_SUB_TOPIC,
        token0.address,
        wallet.address,
        wallet.address,
        500
      )
      expect(
        await balanceKeeper["balance(string,bytes)"](EVM_CHAIN, wallet.address)
      ).to.eq(500)
    })

    it("routes event to subtract gton", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper["add(string,bytes,uint256)"](
        EVM_CHAIN,
        wallet.address,
        1000
      )
      await lockRouter.setCanRoute(wallet.address, true)
      await balanceKeeper.setCanSubtract(lockRouter.address, true)
      await expect(
        lockRouter.routeValue(
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
        .to.emit(lockRouter, "GTONSub")
        .withArgs(
          MOCK_UUID,
          EVM_CHAIN,
          other.address.toLowerCase(),
          token0.address.toLowerCase(),
          wallet.address.toLowerCase(),
          wallet.address.toLowerCase(),
          500
        )
    })

    it("fails if the router is not allowed to add lp", async () => {
      await lockRouter.setCanRoute(wallet.address, true)
      await expect(
        lockRouter.routeValue(
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
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await balanceKeeper.setCanOpen(lockRouter.address, true)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      await lpKeeper.setCanOpen(lockRouter.address, true)
      await lpKeeper.setCanAdd(lockRouter.address, true)
      await lockRouter.setCanRoute(wallet.address, true)
      await lockRouter.routeValue(
        MOCK_UUID,
        EVM_CHAIN,
        other.address,
        LP_ADD_TOPIC,
        token1.address,
        wallet.address,
        wallet.address,
        1000
      )
      expect(
        await lpKeeper["balance(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(1000)
    })

    it("routes to add lp, opens user and token", async () => {
      await balanceKeeper.setCanOpen(lockRouter.address, true)
      await lpKeeper.setCanOpen(lockRouter.address, true)
      await lpKeeper.setCanAdd(lockRouter.address, true)
      await lockRouter.setCanRoute(wallet.address, true)
      await lockRouter.routeValue(
        MOCK_UUID,
        EVM_CHAIN,
        other.address,
        LP_ADD_TOPIC,
        token1.address,
        wallet.address,
        wallet.address,
        1000
      )
      expect(
        await lpKeeper["balance(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(1000)
    })

    it("emits event to add lp", async () => {
      await balanceKeeper.setCanOpen(lockRouter.address, true)
      await lpKeeper.setCanOpen(lockRouter.address, true)
      await lpKeeper.setCanAdd(lockRouter.address, true)
      await lockRouter.setCanRoute(wallet.address, true)
      await expect(
        lockRouter.routeValue(
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
        .to.emit(lockRouter, "LPAdd")
        .withArgs(
          MOCK_UUID,
          EVM_CHAIN,
          other.address.toLowerCase(),
          token1.address.toLowerCase(),
          wallet.address.toLowerCase(),
          wallet.address.toLowerCase(),
          1000
        )
    })

    it("fails if router is not allowed to subtract lp", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1000
      )
      await lockRouter.setCanRoute(wallet.address, true)
      await expect(
        lockRouter.routeValue(
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
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1000
      )
      await lpKeeper.setCanSubtract(lockRouter.address, true)
      await lockRouter.setCanRoute(wallet.address, true)
      await lockRouter.routeValue(
        MOCK_UUID,
        EVM_CHAIN,
        other.address,
        LP_SUB_TOPIC,
        token1.address,
        wallet.address,
        wallet.address,
        500
      )
      expect(
        await lpKeeper["balance(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(500)
    })

    it("emits event to subtract lp", async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(EVM_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1000
      )
      await lpKeeper.setCanSubtract(lockRouter.address, true)
      await lockRouter.setCanRoute(wallet.address, true)
      await expect(
        lockRouter.routeValue(
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
        .to.emit(lockRouter, "LPSub")
        .withArgs(
          MOCK_UUID,
          EVM_CHAIN,
          other.address.toLowerCase(),
          token1.address.toLowerCase(),
          wallet.address.toLowerCase(),
          wallet.address.toLowerCase(),
          500
        )
    })
  })
})
