import { ethers, waffle } from "hardhat"
import { BigNumber } from "ethers"

import { TestERC20 } from "../../typechain/TestERC20"
import { ImpactKeeperTest } from "../../typechain/ImpactKeeperTest"
import { ImpactEB } from "../../typechain/ImpactEB"
import { MockTimeFarmCurved } from "../../typechain/MockTimeFarmCurved"
import { MockTimeFarmLinear } from "../../typechain/MockTimeFarmLinear"
import { LockGTON } from "../../typechain/LockGTON"
import { LockUnlockLP } from "../../typechain/LockUnlockLP"

import { BalanceKeeper } from "../../typechain/BalanceKeeper"
import { Voter } from "../../typechain/Voter"
import { BalanceAdderEB } from "../../typechain/BalanceAdderEB"
import { BalanceAdderStaking } from "../../typechain/BalanceAdderStaking"
import { LPKeeper } from "../../typechain/LPKeeper"
import { OracleRouter } from "../../typechain/OracleRouter"
import { OracleParser } from "../../typechain/OracleParser"
import { MockTimeClaimGTON } from "../../typechain/MockTimeClaimGTON"

import { BalanceKeeperV2 } from "../../typechain/BalanceKeeperV2"
import { VoterV2 } from "../../typechain/VoterV2"
import { LPKeeperV2 } from "../../typechain/LPKeeperV2"
import { LockRouter } from "../../typechain/LockRouter"
import { OracleParserV2 } from "../../typechain/OracleParserV2"
import { SharesEB } from "../../typechain/SharesEB"
import { SharesLP } from "../../typechain/SharesLP"
import { BalanceAdderV2 } from "../../typechain/BalanceAdderV2"

import { LockGTONOnchain } from "../../typechain/LockGTONOnchain"
import { LockUnlockLPOnchain } from "../../typechain/LockUnlockLPOnchain"

import { MockTimeClaimGTONAbsolute } from "../../typechain/MockTimeClaimGTONAbsolute"
import { MockTimeClaimGTONPercent } from "../../typechain/MockTimeClaimGTONPercent"

import { WrappedNative } from "../../typechain/WrappedNative"
import { UniswapV2Pair } from "../../typechain/UniswapV2Pair"
import { UniswapV2Factory } from "../../typechain/UniswapV2Factory"
import { UniswapV2Router01 } from "../../typechain/UniswapV2Router01"
import { RelayParser } from "../../typechain/RelayParser"
import { Relay } from "../../typechain/Relay"

import { OTC } from "../../typechain/OTC"
import { MockOTC } from "../../typechain/MockOTC"
import { TestUSDC } from "../../typechain/TestUSDC"

import { BalanceAdderV3 } from "../../typechain/BalanceAdderV3"

import {
  makeValueImpact,
  EARLY_BIRDS_A,
  EARLY_BIRDS_C,
  STAKING_AMOUNT,
  STAKING_PERIOD,
  GTON_ADD_TOPIC,
  GTON_SUB_TOPIC,
  LP_ADD_TOPIC,
  LP_SUB_TOPIC,
  RELAY_TOPIC,
  EVM_CHAIN,
  FTM_CHAIN,
  BNB_CHAIN,
  PLG_CHAIN,
  expandTo18Decimals,
  MAX_UINT,
} from "./utilities"

import { Fixture } from "ethereum-waffle"

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_START_TIME = 1601906400

interface TokensFixture {
  token0: TestERC20
  token1: TestERC20
  token2: TestERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory("TestERC20")
  const tokenA = (await tokenFactory.deploy(
    BigNumber.from(2).pow(255)
  )) as TestERC20
  const tokenB = (await tokenFactory.deploy(
    BigNumber.from(2).pow(255)
  )) as TestERC20
  const tokenC = (await tokenFactory.deploy(
    BigNumber.from(2).pow(255)
  )) as TestERC20

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort(
    (tokenA, tokenB) =>
      tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { token0, token1, token2 }
}

interface ImpactKeeperFixture extends TokensFixture {
  impactKeeper: ImpactKeeperTest
}

export const impactKeeperFixture: Fixture<ImpactKeeperFixture> =
  async function (
    [wallet, other, nebula],
    provider
  ): Promise<ImpactKeeperFixture> {
    const { token0, token1, token2 } = await tokensFixture()

    const impactKeeperFactory = await ethers.getContractFactory(
      "ImpactKeeperTest"
    )
    const impactKeeper = (await impactKeeperFactory.deploy(
      wallet.address,
      nebula.address,
      [token1.address, token2.address]
    )) as ImpactKeeperTest
    return {
      token0,
      token1,
      token2,
      impactKeeper,
    }
  }

interface ImpactEBFixture extends TokensFixture {
  impactEB: ImpactEB
}

export const impactEBFixture: Fixture<ImpactEBFixture> = async function (
  [wallet, other, nebula],
  provider
): Promise<ImpactEBFixture> {
  const { token0, token1, token2 } = await tokensFixture()

  const impactEBFactory = await ethers.getContractFactory("ImpactEB")
  const impactEB = (await impactEBFactory.deploy(
    wallet.address,
    nebula.address,
    [token1.address, token2.address]
  )) as ImpactEB
  return {
    token0,
    token1,
    token2,
    impactEB,
  }
}

interface FarmCurvedFixture {
  farm: MockTimeFarmCurved
}

async function farmCurvedFixture(): Promise<FarmCurvedFixture> {
  const farmFactory = await ethers.getContractFactory("MockTimeFarmCurved")
  const farm = (await farmFactory.deploy(
    EARLY_BIRDS_A,
    EARLY_BIRDS_C,
    0
  )) as MockTimeFarmCurved
  return { farm }
}

interface FarmLinearFixture {
  farm: MockTimeFarmLinear
}

async function farmLinearFixture(): Promise<FarmLinearFixture> {
  const farmFactory = await ethers.getContractFactory("MockTimeFarmLinear")
  const farm = (await farmFactory.deploy(
    STAKING_AMOUNT,
    STAKING_PERIOD,
    0
  )) as MockTimeFarmLinear
  return { farm }
}

interface BalanceKeeperFixture {
  balanceKeeper: BalanceKeeper
}

async function balanceKeeperFixture(): Promise<BalanceKeeperFixture> {
  const balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeper")
  const balanceKeeper = (await balanceKeeperFactory.deploy()) as BalanceKeeper
  return { balanceKeeper }
}

type FarmCurvedAndImpactEBAndBalanceKeeperFixture = FarmCurvedFixture &
  ImpactEBFixture &
  BalanceKeeperFixture

interface BalanceAdderEBFixture
  extends FarmCurvedAndImpactEBAndBalanceKeeperFixture {
  balanceAdderEB: BalanceAdderEB
}

export const balanceAdderEBFixture: Fixture<BalanceAdderEBFixture> =
  async function (
    [wallet, other, nebula],
    provider
  ): Promise<BalanceAdderEBFixture> {
    const { farm } = await farmCurvedFixture()
    const { token0, token1, token2, impactEB } = await impactEBFixture(
      [wallet, other, nebula],
      provider
    )
    const { balanceKeeper } = await balanceKeeperFixture()

    await impactEB
      .connect(nebula)
      .attachValue(
        makeValueImpact(token1.address, wallet.address, "1000", "0", "0")
      )
    await impactEB
      .connect(nebula)
      .attachValue(
        makeValueImpact(token2.address, other.address, "1000", "1", "0")
      )

    const balanceAdderEBFactory = await ethers.getContractFactory(
      "BalanceAdderEB"
    )
    const balanceAdderEB = (await balanceAdderEBFactory.deploy(
      farm.address,
      impactEB.address,
      balanceKeeper.address
    )) as BalanceAdderEB
    return {
      farm,
      token0,
      token1,
      token2,
      impactEB,
      balanceKeeper,
      balanceAdderEB,
    }
  }

interface VoterFixture extends BalanceKeeperFixture {
  voter: Voter
}

export const voterFixture: Fixture<VoterFixture> = async function (
  [wallet, other],
  provider
): Promise<VoterFixture> {
  const { balanceKeeper } = await balanceKeeperFixture()

  const voterFactory = await ethers.getContractFactory("Voter")
  const voter = (await voterFactory.deploy(balanceKeeper.address)) as Voter
  return {
    balanceKeeper,
    voter,
  }
}

type FarmLinearAndBalanceKeeperFixture = FarmLinearFixture &
  BalanceKeeperFixture

interface BalanceAdderStakingFixture extends FarmLinearAndBalanceKeeperFixture {
  balanceAdderStaking: BalanceAdderStaking
}

export const balanceAdderStakingFixture: Fixture<BalanceAdderStakingFixture> =
  async function (
    [wallet, other],
    provider
  ): Promise<BalanceAdderStakingFixture> {
    const { balanceKeeper } = await balanceKeeperFixture()
    const { farm } = await farmLinearFixture()

    const balanceAdderStakingFactory = await ethers.getContractFactory(
      "BalanceAdderStaking"
    )
    const balanceAdderStaking = (await balanceAdderStakingFactory.deploy(
      farm.address,
      balanceKeeper.address
    )) as BalanceAdderStaking
    return {
      farm,
      balanceKeeper,
      balanceAdderStaking,
    }
  }

interface LPKeeperFixture extends TokensFixture {
  lpKeeper: LPKeeper
}

export const lpKeeperFixture: Fixture<LPKeeperFixture> = async function (
  [wallet, other],
  provider
): Promise<LPKeeperFixture> {
  const { token0, token1, token2 } = await tokensFixture()
  const lpKeeperFactory = await ethers.getContractFactory("LPKeeper")
  const lpKeeper = (await lpKeeperFactory.deploy()) as LPKeeper
  return {
    token0,
    token1,
    token2,
    lpKeeper,
  }
}

type BalanceKeeperAndLPKeeperFixture = BalanceKeeperFixture & LPKeeperFixture

interface OracleRouterFixture extends BalanceKeeperAndLPKeeperFixture {
  oracleRouter: OracleRouter
}

export const oracleRouterFixture: Fixture<OracleRouterFixture> =
  async function ([wallet, other], provider): Promise<OracleRouterFixture> {
    const { balanceKeeper } = await balanceKeeperFixture()
    const { token0, token1, token2, lpKeeper } = await lpKeeperFixture(
      [wallet, other],
      provider
    )

    const oracleRouterFactory = await ethers.getContractFactory("OracleRouter")
    const oracleRouter = (await oracleRouterFactory.deploy(
      balanceKeeper.address,
      lpKeeper.address,
      GTON_ADD_TOPIC,
      GTON_SUB_TOPIC,
      LP_ADD_TOPIC,
      LP_SUB_TOPIC
    )) as OracleRouter
    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      lpKeeper,
      oracleRouter,
    }
  }

interface OracleParserFixture extends OracleRouterFixture {
  oracleParser: OracleParser
}

export const oracleParserFixture: Fixture<OracleParserFixture> =
  async function (
    [wallet, other, nebula],
    provider
  ): Promise<OracleParserFixture> {
    const { token0, token1, token2, balanceKeeper, lpKeeper, oracleRouter } =
      await oracleRouterFixture([wallet, other], provider)

    const oracleParserFactory = await ethers.getContractFactory("OracleParser")
    const oracleParser = (await oracleParserFactory.deploy(
      oracleRouter.address,
      nebula.address
    )) as OracleParser
    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      lpKeeper,
      oracleRouter,
      oracleParser,
    }
  }

type TokensAndVoterFixture = TokensFixture & VoterFixture

interface ClaimGTONFixture extends TokensAndVoterFixture {
  claimGTON: MockTimeClaimGTON
}

export const claimGTONFixture: Fixture<ClaimGTONFixture> = async function (
  [wallet, other],
  provider
): Promise<ClaimGTONFixture> {
  const { token0, token1, token2 } = await tokensFixture()
  const { balanceKeeper, voter } = await voterFixture([wallet, other], provider)

  const claimGTONFactory = await ethers.getContractFactory("MockTimeClaimGTON")
  const claimGTON = (await claimGTONFactory.deploy(
    token0.address,
    wallet.address,
    balanceKeeper.address,
    voter.address
  )) as MockTimeClaimGTON
  return {
    token0,
    token1,
    token2,
    balanceKeeper,
    voter,
    claimGTON,
  }
}

interface BalanceKeeperV2Fixture {
  balanceKeeper: BalanceKeeperV2
}

async function balanceKeeperV2Fixture(): Promise<BalanceKeeperV2Fixture> {
  const balanceKeeperFactory = await ethers.getContractFactory(
    "BalanceKeeperV2"
  )
  const balanceKeeper = (await balanceKeeperFactory.deploy()) as BalanceKeeperV2

  return { balanceKeeper }
}

interface VoterV2Fixture extends BalanceKeeperV2Fixture {
  voter: VoterV2
}

export const voterV2Fixture: Fixture<VoterV2Fixture> = async function (
  [wallet, other],
  provider
): Promise<VoterV2Fixture> {
  const { balanceKeeper } = await balanceKeeperV2Fixture()

  const voterFactory = await ethers.getContractFactory("VoterV2")
  const voter = (await voterFactory.deploy(balanceKeeper.address)) as VoterV2
  return {
    balanceKeeper,
    voter,
  }
}

type TokensAndBalanceKeeperV2Fixture = TokensFixture & BalanceKeeperV2Fixture

interface LPKeeperV2Fixture extends TokensAndBalanceKeeperV2Fixture {
  lpKeeper: LPKeeperV2
}

export const lpKeeperV2Fixture: Fixture<LPKeeperV2Fixture> = async function (
  [wallet, other],
  provider
): Promise<LPKeeperV2Fixture> {
  const { token0, token1, token2 } = await tokensFixture()
  const { balanceKeeper } = await balanceKeeperV2Fixture()
  const lpKeeperFactory = await ethers.getContractFactory("LPKeeperV2")
  const lpKeeper = (await lpKeeperFactory.deploy(
    balanceKeeper.address
  )) as LPKeeperV2
  return {
    token0,
    token1,
    token2,
    balanceKeeper,
    lpKeeper,
  }
}

interface LockRouterFixture extends LPKeeperV2Fixture {
  lockRouter: LockRouter
}

export const lockRouterFixture: Fixture<LockRouterFixture> = async function (
  [wallet, other],
  provider
): Promise<LockRouterFixture> {
  const { token0, token1, token2, balanceKeeper, lpKeeper } =
    await lpKeeperV2Fixture([wallet, other], provider)

  const lockRouterFactory = await ethers.getContractFactory("LockRouter")
  const lockRouter = (await lockRouterFactory.deploy(
    balanceKeeper.address,
    lpKeeper.address,
    GTON_ADD_TOPIC,
    GTON_SUB_TOPIC,
    LP_ADD_TOPIC,
    LP_SUB_TOPIC
  )) as LockRouter
  return {
    token0,
    token1,
    token2,
    balanceKeeper,
    lpKeeper,
    lockRouter,
  }
}

interface OracleParserV2Fixture extends LockRouterFixture {
  oracleParser: OracleParserV2
}

export const oracleParserV2Fixture: Fixture<OracleParserV2Fixture> =
  async function (
    [wallet, other, nebula],
    provider
  ): Promise<OracleParserV2Fixture> {
    const { token0, token1, token2, balanceKeeper, lpKeeper, lockRouter } =
      await lockRouterFixture([wallet, other], provider)

    const oracleParserFactory = await ethers.getContractFactory(
      "OracleParserV2"
    )
    const oracleParser = (await oracleParserFactory.deploy(
      lockRouter.address,
      nebula.address,
      [BNB_CHAIN]
    )) as OracleParserV2
    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      lpKeeper,
      lockRouter,
      oracleParser,
    }
  }

type TokensAndVoterV2Fixture = TokensFixture & VoterV2Fixture

interface ClaimGTONPercentFixture extends TokensAndVoterV2Fixture {
  claimGTON: MockTimeClaimGTONPercent
}

export const claimGTONPercentFixture: Fixture<ClaimGTONPercentFixture> =
  async function ([wallet, other], provider): Promise<ClaimGTONPercentFixture> {
    const { token0, token1, token2 } = await tokensFixture()
    const { balanceKeeper, voter } = await voterV2Fixture(
      [wallet, other],
      provider
    )

    const claimGTONFactory = await ethers.getContractFactory(
      "MockTimeClaimGTONPercent"
    )
    const claimGTON = (await claimGTONFactory.deploy(
      token0.address,
      wallet.address,
      balanceKeeper.address,
      voter.address,
      50
    )) as MockTimeClaimGTONPercent
    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      voter,
      claimGTON,
    }
  }

interface ClaimGTONAbsoluteFixture extends TokensAndVoterV2Fixture {
  claimGTON: MockTimeClaimGTONAbsolute
}

export const claimGTONAbsoluteFixture: Fixture<ClaimGTONAbsoluteFixture> =
  async function (
    [wallet, other],
    provider
  ): Promise<ClaimGTONAbsoluteFixture> {
    const { token0, token1, token2 } = await tokensFixture()
    const { balanceKeeper, voter } = await voterV2Fixture(
      [wallet, other],
      provider
    )

    const claimGTONFactory = await ethers.getContractFactory(
      "MockTimeClaimGTONAbsolute"
    )
    const claimGTON = (await claimGTONFactory.deploy(
      token0.address,
      wallet.address,
      balanceKeeper.address,
      voter.address,
      expandTo18Decimals(100),
      86400
    )) as MockTimeClaimGTONAbsolute
    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      voter,
      claimGTON,
    }
  }

type ImpactEBAndBalanceKeeperV2Fixture = ImpactEBFixture &
  BalanceKeeperV2Fixture

interface SharesEBFixture extends ImpactEBAndBalanceKeeperV2Fixture {
  sharesEB: SharesEB
}

export const sharesEBFixture: Fixture<SharesEBFixture> = async function (
  [wallet, other, nebula],
  provider
): Promise<SharesEBFixture> {
  const { token0, token1, token2, impactEB } = await impactEBFixture(
    [wallet, other, nebula],
    provider
  )
  const { balanceKeeper } = await balanceKeeperV2Fixture()

  const sharesEBFactory = await ethers.getContractFactory("SharesEB")
  const sharesEB = (await sharesEBFactory.deploy(
    balanceKeeper.address,
    impactEB.address
  )) as SharesEB
  return {
    token0,
    token1,
    token2,
    impactEB,
    balanceKeeper,
    sharesEB,
  }
}

interface SharesLPFixture extends LPKeeperV2Fixture {
  sharesLP: SharesLP
}

export const sharesLPFixture: Fixture<SharesLPFixture> = async function (
  [wallet, other],
  provider
): Promise<SharesLPFixture> {
  const { token0, token1, token2, balanceKeeper, lpKeeper } =
    await lpKeeperV2Fixture([wallet, other], provider)

  await lpKeeper.setCanOpen(wallet.address, true)
  await lpKeeper.open(EVM_CHAIN, token1.address)

  const sharesLPFactory = await ethers.getContractFactory("SharesLP")
  const sharesLP = (await sharesLPFactory.deploy(
    lpKeeper.address,
    0
  )) as SharesLP
  return {
    token0,
    token1,
    token2,
    balanceKeeper,
    lpKeeper,
    sharesLP,
  }
}

interface LockGTONFixture extends TokensFixture {
  lockGTON: LockGTON
}

export const lockGTONFixture: Fixture<LockGTONFixture> = async function (
  [wallet, other, nebula],
  provider
): Promise<LockGTONFixture> {
  const { token0, token1, token2 } = await tokensFixture()

  const lockGTONFactory = await ethers.getContractFactory("LockGTON")
  const lockGTON = (await lockGTONFactory.deploy(token0.address)) as LockGTON
  return {
    token0,
    token1,
    token2,
    lockGTON,
  }
}

interface LockUnlockLPFixture extends TokensFixture {
  lockUnlockLP: LockUnlockLP
}

export const lockUnlockLPFixture: Fixture<LockUnlockLPFixture> =
  async function (
    [wallet, other, nebula],
    provider
  ): Promise<LockUnlockLPFixture> {
    const { token0, token1, token2 } = await tokensFixture()

    const lockUnlockLPFactory = await ethers.getContractFactory("LockUnlockLP")
    const lockUnlockLP = (await lockUnlockLPFactory.deploy([
      token1.address,
    ])) as LockUnlockLP
    return {
      token0,
      token1,
      token2,
      lockUnlockLP,
    }
  }

interface BalanceAdderV2Fixture extends TokensAndBalanceKeeperV2Fixture {
  farmStaking: MockTimeFarmLinear
  impactEB: ImpactEB
  sharesEB: SharesEB
  farmEB: MockTimeFarmCurved
  lpKeeper: LPKeeperV2
  sharesLP1: SharesLP
  farmLP1: MockTimeFarmLinear
  sharesLP2: SharesLP
  farmLP2: MockTimeFarmLinear
  balanceAdder: BalanceAdderV2
}

export const balanceAdderV2Fixture: Fixture<BalanceAdderV2Fixture> =
  async function (
    [wallet, other, nebula],
    provider
  ): Promise<BalanceAdderV2Fixture> {
    const { token0, token1, token2 } = await tokensFixture()

    const { balanceKeeper } = await balanceKeeperV2Fixture()

    const { farm: farmStaking } = await farmLinearFixture()

    const impactEBFactory = await ethers.getContractFactory("ImpactEB")
    const impactEB = (await impactEBFactory.deploy(
      wallet.address,
      nebula.address,
      [token1.address, token2.address]
    )) as ImpactEB

    const sharesEBFactory = await ethers.getContractFactory("SharesEB")
    const sharesEB = (await sharesEBFactory.deploy(
      balanceKeeper.address,
      impactEB.address
    )) as SharesEB

    const { farm: farmEB } = await farmCurvedFixture()

    const lpKeeperFactory = await ethers.getContractFactory("LPKeeperV2")
    const lpKeeper = (await lpKeeperFactory.deploy(
      balanceKeeper.address
    )) as LPKeeperV2

    await lpKeeper.setCanOpen(wallet.address, true)
    await lpKeeper.open(EVM_CHAIN, token1.address)
    await lpKeeper.open(EVM_CHAIN, token2.address)

    const sharesLPFactory = await ethers.getContractFactory("SharesLP")
    const sharesLP1 = (await sharesLPFactory.deploy(
      lpKeeper.address,
      0
    )) as SharesLP

    const { farm: farmLP1 } = await farmLinearFixture()

    const sharesLP2 = (await sharesLPFactory.deploy(
      lpKeeper.address,
      1
    )) as SharesLP

    const { farm: farmLP2 } = await farmLinearFixture()

    const balanceAdderFactory = await ethers.getContractFactory(
      "BalanceAdderV2"
    )
    const balanceAdder = (await balanceAdderFactory.deploy(
      balanceKeeper.address
    )) as BalanceAdderV2
    return {
      token0,
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
      balanceAdder,
    }
  }

interface LockGTONOnchainFixture extends TokensAndBalanceKeeperV2Fixture {
  lockGTON: LockGTONOnchain
}

export const lockGTONOnchainFixture: Fixture<LockGTONOnchainFixture> =
  async function (
    [wallet, other, nebula],
    provider
  ): Promise<LockGTONOnchainFixture> {
    const { token0, token1, token2 } = await tokensFixture()
    const { balanceKeeper } = await balanceKeeperV2Fixture()

    const lockGTONFactory = await ethers.getContractFactory("LockGTONOnchain")
    const lockGTON = (await lockGTONFactory.deploy(
      token0.address,
      balanceKeeper.address
    )) as LockGTONOnchain
    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      lockGTON,
    }
  }

interface LockUnlockLPOnchainFixture extends LPKeeperV2Fixture {
  lockUnlockLP: LockUnlockLPOnchain
}

export const lockUnlockLPOnchainFixture: Fixture<LockUnlockLPOnchainFixture> =
  async function (
    [wallet, other, nebula],
    provider
  ): Promise<LockUnlockLPOnchainFixture> {
    const { token0, token1, token2, balanceKeeper, lpKeeper } =
      await lpKeeperV2Fixture([wallet, other], provider)

    const lockUnlockLPFactory = await ethers.getContractFactory(
      "LockUnlockLPOnchain"
    )
    const lockUnlockLP = (await lockUnlockLPFactory.deploy(
      [token1.address],
      balanceKeeper.address,
      lpKeeper.address
    )) as LockUnlockLPOnchain
    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      lpKeeper,
      lockUnlockLP,
    }
  }

interface UniswapFixture extends TokensFixture {
  weth: WrappedNative
  uniswapV2Pair: UniswapV2Pair
  uniswapV2Factory: UniswapV2Factory
  uniswapV2Router01: UniswapV2Router01
}

const uniswapFixture: Fixture<UniswapFixture> = async function (
  [wallet, other],
  provider
): Promise<UniswapFixture> {
  const { token0, token1, token2 } = await tokensFixture()

  const wethFactory = await ethers.getContractFactory("WrappedNative")
  const weth = (await wethFactory.deploy()) as WrappedNative

  const uniswapV2FactoryFactory = await ethers.getContractFactory(
    "UniswapV2Factory"
  )
  const uniswapV2Factory = (await uniswapV2FactoryFactory.deploy(
    wallet.address
  )) as UniswapV2Factory

  const uniswapV2Router01Factory = await ethers.getContractFactory(
    "UniswapV2Router01"
  )
  const uniswapV2Router01 = (await uniswapV2Router01Factory.deploy(
    uniswapV2Factory.address,
    weth.address
  )) as UniswapV2Router01

  await uniswapV2Factory.createPair(weth.address, token0.address)

  const uniswapV2PairFactory = await ethers.getContractFactory("UniswapV2Pair")
  // log pairV2 bytecode for init code hash in the router
  // let bytecode = uniswapV2PairFactory.bytecode
  // console.log(ethers.utils.solidityKeccak256(["bytes"],[bytecode]))
  let pairAddress = await uniswapV2Factory.getPair(weth.address, token0.address)
  const uniswapV2Pair = uniswapV2PairFactory.attach(
    pairAddress
  ) as UniswapV2Pair

  let liquidity = expandTo18Decimals(10)
  let liquidityx2 = expandTo18Decimals(20)
  await token0.approve(uniswapV2Router01.address, liquidityx2)
  let block = await wallet.provider.getBlock("latest")
  let timestamp = block.timestamp
  await uniswapV2Router01.addLiquidityETH(
    token0.address,
    liquidityx2,
    liquidityx2,
    liquidity,
    wallet.address,
    timestamp + 3600,
    { value: liquidity }
  )

  return {
    token0,
    token1,
    token2,
    weth,
    uniswapV2Factory,
    uniswapV2Router01,
    uniswapV2Pair,
  }
}

interface RelayFixture extends UniswapFixture {
  relayParser: RelayParser
  relay: Relay
}

export const relayFixture: Fixture<RelayFixture> = async function (
  [wallet, other, nebula],
  provider
): Promise<RelayFixture> {
  const {
    token0,
    token1,
    token2,
    weth,
    uniswapV2Factory,
    uniswapV2Router01,
    uniswapV2Pair,
  } = await uniswapFixture([wallet, other], provider)

  const relayFactory = await ethers.getContractFactory("Relay")
  const relay = (await relayFactory.deploy(
    weth.address,
    uniswapV2Router01.address,
    token0.address,
    RELAY_TOPIC,
    [FTM_CHAIN, BNB_CHAIN, PLG_CHAIN],
    [
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    [
      [0, MAX_UINT],
      [0, MAX_UINT],
      [0, MAX_UINT],
    ]
  )) as Relay

  const relayParserFactory = await ethers.getContractFactory("RelayParser")
  const relayParser = (await relayParserFactory.deploy(
    relay.address,
    nebula.address,
    [BNB_CHAIN]
  )) as RelayParser

  return {
    token0,
    token1,
    token2,
    weth,
    uniswapV2Factory,
    uniswapV2Router01,
    uniswapV2Pair,
    relayParser,
    relay,
  }
}

interface USDCFixture {
  usdc: TestUSDC
}

async function usdcFixture(owner: string): Promise<USDCFixture> {
  const tokenFactory = await ethers.getContractFactory("TestUSDC")

  let name = "USDC"
  let symbol = "USDC"
  let decimals = 6

  const usdc = (await tokenFactory.deploy(
    name,
    symbol,
    decimals,
    owner
  )) as TestUSDC

  return { usdc }
}

type USDCAndTokensFixture = USDCFixture & TokensFixture

interface OTCFixture extends USDCAndTokensFixture {
  otc: MockOTC
  otcUSDC: MockOTC
}

export const otcFixture: Fixture<OTCFixture> = async function (
  [wallet, other, another],
  provider
): Promise<OTCFixture> {
  const { token0, token1, token2 } = await tokensFixture()
  const { usdc } = await usdcFixture(wallet.address)

  // distribute USDC between counterparties
  let tokens1 = await token1.balanceOf(wallet.address)
  await token1.transfer(other.address, tokens1.div(2))
  await token1.transfer(another.address, tokens1.div(2))

  // set GTON/USDC price, with two decimal precision, 5.00
  let price = 500
  let lowerLimit = 100
  let upperLimit = expandTo18Decimals(100)
  let cliff = 86400
  let vestingTime = 86400 * 7 * 4 * 12
  let numberOfTranches = 12

  const otcFactory = await ethers.getContractFactory("MockOTC")
  const otc = (await otcFactory.deploy(
    token0.address,
    token1.address,
    18,
    price,
    lowerLimit,
    upperLimit,
    cliff,
    vestingTime,
    numberOfTranches,
    "ffffff"
  )) as MockOTC

  price = 500
  lowerLimit = 100
  upperLimit = expandTo18Decimals(100)
  cliff = 86400
  vestingTime = 86400 * 7 * 4
  numberOfTranches = 4

  const otcUSDC = (await otcFactory.deploy(
    token0.address,
    usdc.address,
    6,
    price,
    lowerLimit,
    upperLimit,
    cliff,
    vestingTime,
    numberOfTranches,
    "ffffff"
  )) as MockOTC

  return {
    token0,
    token1,
    token2,
    usdc,
    otc,
    otcUSDC,
  }
}

interface BalanceAdderV3Fixture extends TokensAndBalanceKeeperV2Fixture {
  farm: MockTimeFarmLinear
  lpKeeper: LPKeeperV2
  balanceAdder: BalanceAdderV3
}

export const balanceAdderV3Fixture: Fixture<BalanceAdderV3Fixture> =
  async function (
    [wallet, other, nebula],
    provider
  ): Promise<BalanceAdderV3Fixture> {
    const { token0, token1, token2 } = await tokensFixture()

    const { balanceKeeper } = await balanceKeeperV2Fixture()

    const { farm } = await farmLinearFixture()

    const lpKeeperFactory = await ethers.getContractFactory("LPKeeperV2")
    const lpKeeper = (await lpKeeperFactory.deploy(
      balanceKeeper.address
    )) as LPKeeperV2

    await lpKeeper.setCanOpen(wallet.address, true)
    await lpKeeper.open(EVM_CHAIN, token1.address)
    await lpKeeper.open(EVM_CHAIN, token2.address)

    const balanceAdderFactory = await ethers.getContractFactory(
      "BalanceAdderV3"
    )
    const balanceAdder = (await balanceAdderFactory.deploy(
      balanceKeeper.address,
      lpKeeper.address,
      farm.address
    )) as BalanceAdderV3

    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      farm,
      lpKeeper,
      balanceAdder,
    }
  }
