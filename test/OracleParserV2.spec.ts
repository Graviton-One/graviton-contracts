import { ethers, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { BalanceKeeperV2 } from '../typechain/BalanceKeeperV2'
import { LPKeeperV2 } from '../typechain/LPKeeperV2'
import { OracleRouterV2 } from '../typechain/OracleRouterV2'
import { OracleParserV2 } from '../typechain/OracleParserV2'
import { oracleParserV2Fixture } from './shared/fixtures'
import { expect } from './shared/expect'
import { makeValueParser,
         GTON_ADD_TOPIC,
         GTON_SUB_TOPIC,
         __LP_ADD_TOPIC,
         __LP_SUB_TOPIC,
         OTHER_TOPIC,
         MOCK_UUID,
         MOCK_CHAIN } from "./shared/utilities";

describe('OracleParserV2', () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before('create fixture loader', async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let lpKeeper: LPKeeperV2
  let oracleRouter: OracleRouterV2
  let oracleParser: OracleParserV2

  beforeEach('deploy test contracts', async () => {
    ;({ token0, token1, token2, balanceKeeper, lpKeeper, oracleRouter, oracleParser } = await loadFixture(oracleParserV2Fixture))
  })

  it('constructor initializes variables', async () => {
    expect(await oracleParser.owner()).to.eq(wallet.address)
    expect(await oracleParser.oracleRouter()).to.eq(oracleRouter.address)
    expect(await oracleParser.nebula()).to.eq(nebula.address)
  })

  it('constructor initializes variables', async () => {
    expect(await oracleParser.uuidIsProcessed(MOCK_UUID)).to.eq(false)
  })

  describe('#setOwner', () => {
    it('fails if caller is not owner', async () => {
      await expect(oracleParser.connect(other).setOwner(wallet.address)).to.be.reverted
    })

    it('emits a SetOwner event', async () => {
      expect(await oracleParser.setOwner(other.address))
        .to.emit(oracleParser, 'SetOwner')
        .withArgs(wallet.address, other.address)
    })

    it('updates owner', async () => {
      await oracleParser.setOwner(other.address)
      expect(await oracleParser.owner()).to.eq(other.address)
    })

    it('cannot be called by original owner', async () => {
      await oracleParser.setOwner(other.address)
      await expect(oracleParser.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe('#setNebula', () => {
    it('fails if caller is not owner', async () => {
      await expect(oracleParser.connect(other).setNebula(other.address)).to.be.reverted
    })

    it('emits a SetNebula event', async () => {
      await expect(oracleParser.setNebula(other.address))
        .to.emit(oracleParser, 'SetNebula')
        .withArgs(nebula.address, other.address)
    })

    it('updates nebula', async () => {
      await oracleParser.setNebula(other.address)
      await expect(await oracleParser.nebula()).to.eq(other.address)
    })
  })

  describe('#setOracleRouter', () => {
    it('fails if caller is not owner', async () => {
      await expect(oracleParser.connect(other).setOracleRouter(other.address)).to.be.reverted
    })

    it('updates oracle router contract', async () => {
      await oracleParser.setOracleRouter(other.address)
      expect(await oracleParser.oracleRouter()).to.eq(other.address)
    })
  })

  describe('#deserializeUint', () => {
    it('fails if starting position is larger than bytes length', async () => {
      let b = ethers.utils.arrayify("0xff");
      await expect(oracleParser.deserializeUint(b, 2, 1)).to.be.reverted
    })

    it('fails if len is larger than bytes length', async () => {
      let b = ethers.utils.arrayify("0xff");
      await expect(oracleParser.deserializeUint(b, 0, 2)).to.be.reverted
    })

    it('returns 0 when bytes are empty', async () => {
      let b = ethers.utils.arrayify("0x");
      await expect(await oracleParser.deserializeUint(b, 0, 0)).to.eq(0)
    })

    it('deserializes small number', async () => {
      let b = ethers.utils.arrayify("0x01");
      await expect(await oracleParser.deserializeUint(b, 0, 1)).to.eq(1)
    })

    it('deserializes large number', async () => {
      let b = ethers.utils.arrayify(wallet.address);
      await expect(await oracleParser.deserializeUint(b, 0, 1)).to.eq(243)
    })
  })

  describe('#deserializeAddress', () => {
    it('fails if bytes length is less than 20', async () => {
      let b = ethers.utils.arrayify("0xff");
      await expect(oracleParser.deserializeAddress(b, 2)).to.be.reverted
    })

    it('fails if starting position leaves less than 20 bytes', async () => {
      let b = ethers.utils.arrayify("0x63b323fcf5e116597d96558a91601f94b1f80396")
      await expect(oracleParser.deserializeAddress(b, 10)).to.be.reverted
    })

    it('deserializes address', async () => {
      let b = ethers.utils.arrayify("0x63b323fcf5e116597d96558a91601f94b1f80396")
      await expect(await oracleParser.deserializeAddress(b, 0))
        .to.eq("0x63b323FcF5e116597D96558A91601f94b1F80396")
    })
  })

  describe('#bytesToBytes32', () => {
    it('returns the same bytes for valid bytes32', async () => {
      expect(await oracleParser.bytesToBytes32(GTON_ADD_TOPIC, 0)).to.eq(GTON_ADD_TOPIC)
    })
  })

  describe('#bytesToBytes16', () => {
    it('returns the same bytes for valid bytes16', async () => {
      expect(await oracleParser.bytesToBytes16(MOCK_UUID, 0)).to.eq(MOCK_UUID)
    })
  })

  describe('#attachValue', () => {
    it('fails if caller is not nebula', async () => {
      await expect(oracleParser.attachValue(makeValueParser(MOCK_UUID, MOCK_CHAIN, other.address
                                                           ,"0x04", GTON_ADD_TOPIC, token0.address
                                                           ,wallet.address, wallet.address, "1000")))
        .to.be.reverted
    })

    it('returns if data length is not valid', async () => {
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.setCanRoute(oracleParser.address, true)
      oracleParser = oracleParser.connect(nebula)
      await expect(oracleParser.attachValue(makeValueParser(MOCK_UUID, MOCK_CHAIN, other.address
                                                           ,"0x0104", GTON_ADD_TOPIC, token0.address
                                                           ,wallet.address, wallet.address, "1000")))
          .to.not.emit(oracleParser, 'AttachValue')
    })

    it('does not emit event if the declared number of topics is not valid', async () => {
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.setCanRoute(oracleParser.address, true)
      oracleParser = oracleParser.connect(nebula)
      await expect(oracleParser.attachValue(makeValueParser(MOCK_UUID, MOCK_CHAIN, other.address
                                                           ,"0x03", GTON_ADD_TOPIC, token0.address
                                                           ,wallet.address, wallet.address, "1000")))
          .to.not.emit(oracleParser, 'AttachValue')
    })

    it('does not emit event if the uuid has already been processed', async () => {
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.setCanRoute(oracleParser.address, true)
      oracleParser = oracleParser.connect(nebula)
      await oracleParser.attachValue(makeValueParser(MOCK_UUID, MOCK_CHAIN, other.address
                                                     ,"0x04", GTON_ADD_TOPIC, token0.address
                                                     ,wallet.address, wallet.address, "1000"))
      await expect(oracleParser.attachValue(makeValueParser(MOCK_UUID, MOCK_CHAIN, other.address
                                                           ,"0x04", GTON_ADD_TOPIC, token0.address
                                                           ,wallet.address, wallet.address, "1000")))
          .to.not.emit(oracleParser, 'AttachValue')
    })

    it('does not emit event if the chain is not EVM', async () => {
      await oracleRouter.setCanRoute(oracleParser.address, true)
      oracleParser = oracleParser.connect(nebula)
      await expect(oracleParser.attachValue(makeValueParser(MOCK_UUID, "FVM", other.address
                                                           ,"0x03", GTON_ADD_TOPIC, token0.address
                                                           ,wallet.address, wallet.address, "1000")))
          .to.not.emit(oracleParser, 'AttachValue')
    })

    it('parses to the router to add gton', async () => {
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.setCanRoute(oracleParser.address, true)
      oracleParser = oracleParser.connect(nebula)
      await oracleParser.attachValue(makeValueParser(MOCK_UUID, MOCK_CHAIN, other.address
                                                     ,"0x04", GTON_ADD_TOPIC, token0.address
                                                     ,wallet.address, wallet.address, "1000"))
      expect(await balanceKeeper['balance(string,bytes)'](MOCK_CHAIN, wallet.address)).to.eq(1000)
    })

    it('parses to the router to subtract gton', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      ethers.utils.hexZeroPad(wallet.address, 32)
      await balanceKeeper.setCanAdd(wallet.address, true)
      await balanceKeeper['add(string,bytes,uint256)'](MOCK_CHAIN, wallet.address, 1000)
      await balanceKeeper.setCanSubtract(oracleRouter.address, true)
      await oracleRouter.setCanRoute(oracleParser.address, true)
      oracleParser = oracleParser.connect(nebula)
      await oracleParser.attachValue(makeValueParser(MOCK_UUID, MOCK_CHAIN, other.address
                                                    ,"0x04", GTON_SUB_TOPIC, token0.address
                                                    ,wallet.address, wallet.address, "500"))
      expect(await balanceKeeper['balance(string,bytes)'](MOCK_CHAIN, wallet.address)).to.eq(500)
    })

    it('parses to the router to add lp', async () => {
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await lpKeeper.setCanOpen(oracleRouter.address, true)
      await lpKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.setCanRoute(oracleParser.address, true)
      oracleParser = oracleParser.connect(nebula)
      await oracleParser.attachValue(makeValueParser(MOCK_UUID, MOCK_CHAIN, other.address
                                                    ,"0x04", __LP_ADD_TOPIC, token1.address
                                                    ,wallet.address, wallet.address, "1000"))
      expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(1000)
    })

    it('parses to the router to subtract lp', async () => {
      await balanceKeeper.setCanOpen(wallet.address, true)
      await balanceKeeper.open(MOCK_CHAIN, wallet.address)
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(MOCK_CHAIN, token1.address)
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper['add(string,bytes,string,bytes,uint256)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address, 1000)
      await lpKeeper.setCanSubtract(oracleRouter.address, true)
      await oracleRouter.setCanRoute(oracleParser.address, true)
      oracleParser = oracleParser.connect(nebula)
      await oracleParser.attachValue(makeValueParser(MOCK_UUID, MOCK_CHAIN, other.address
                                                    ,"0x04", __LP_SUB_TOPIC, token1.address
                                                    ,wallet.address, wallet.address, "500"))
      expect(await lpKeeper['balance(string,bytes,string,bytes)'](MOCK_CHAIN, token1.address, MOCK_CHAIN, wallet.address)).to.eq(500)
    })

    it('emits event', async () => {
      await balanceKeeper.setCanOpen(oracleRouter.address, true)
      await balanceKeeper.setCanAdd(oracleRouter.address, true)
      await oracleRouter.setCanRoute(oracleParser.address, true)
      oracleParser = oracleParser.connect(nebula)
      await expect(oracleParser.attachValue(makeValueParser(MOCK_UUID, MOCK_CHAIN, other.address
                                                           ,"0x04", GTON_ADD_TOPIC, token0.address
                                                           ,wallet.address, wallet.address, "1000")))
          .to.emit(oracleParser, 'AttachValue')
          .withArgs(nebula.address,
                    MOCK_UUID,
                    MOCK_CHAIN,
                    other.address.toLowerCase(),
                    GTON_ADD_TOPIC,
                    token0.address.toLowerCase(),
                    wallet.address.toLowerCase(),
                    wallet.address.toLowerCase(),
                    "1000")
    })
  })
})