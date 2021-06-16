import { ethers, waffle } from "hardhat";
import { BigNumber } from "ethers";

import { TestERC20 } from "../../typechain/TestERC20";
import { ImpactKeeperTest } from "../../typechain/ImpactKeeperTest";
import { MockTimeFarmCurved } from "../../typechain/MockTimeFarmCurved";
import { MockTimeFarmLinear } from "../../typechain/MockTimeFarmLinear";
import { ImpactEB } from "../../typechain/ImpactEB";
import { BalanceKeeper } from "../../typechain/BalanceKeeper";
import { Voter } from "../../typechain/Voter";
import { BalanceAdderEB } from "../../typechain/BalanceAdderEB";
import { BalanceAdderStaking } from "../../typechain/BalanceAdderStaking";
import { BalanceAdderLP } from "../../typechain/BalanceAdderLP";
import { LPKeeper } from "../../typechain/LPKeeper";
import { OracleRouter } from "../../typechain/OracleRouter";
import { OracleParser } from "../../typechain/OracleParser";
import { MockTimeClaimGTON } from "../../typechain/MockTimeClaimGTON";

import { BalanceKeeperV2 } from "../../typechain/BalanceKeeperV2";
import { VoterV2 } from "../../typechain/VoterV2";

import {
  makeValueImpact,
  EARLY_BIRDS_A,
  EARLY_BIRDS_C,
  STAKING_AMOUNT,
  STAKING_PERIOD,
  GTON_ADD_TOPIC,
  GTON_SUB_TOPIC,
  __LP_ADD_TOPIC,
  __LP_SUB_TOPIC
} from "./utilities";

import { Fixture } from "ethereum-waffle";

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_START_TIME = 1601906400;

interface TokensFixture {
  token0: TestERC20;
  token1: TestERC20;
  token2: TestERC20;
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory("TestERC20");
  const tokenA = (await tokenFactory.deploy(
    BigNumber.from(2).pow(255)
  )) as TestERC20;
  const tokenB = (await tokenFactory.deploy(
    BigNumber.from(2).pow(255)
  )) as TestERC20;
  const tokenC = (await tokenFactory.deploy(
    BigNumber.from(2).pow(255)
  )) as TestERC20;

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort(
    (tokenA, tokenB) =>
      tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  );

  return { token0, token1, token2 };
}

interface ImpactKeeperFixture extends TokensFixture {
  impactKeeper: ImpactKeeperTest;
}

export const impactKeeperFixture: Fixture<ImpactKeeperFixture> =
  async function (
    [wallet, other, nebula],
    provider
  ): Promise<ImpactKeeperFixture> {
    const { token0, token1, token2 } = await tokensFixture();

    const impactKeeperFactory = await ethers.getContractFactory(
      "ImpactKeeperTest"
    );
    const impactKeeper = (await impactKeeperFactory.deploy(
      wallet.address,
      nebula.address,
      [token1.address, token2.address]
    )) as ImpactKeeperTest;
    return {
      token0,
      token1,
      token2,
      impactKeeper,
    };
  };

interface ImpactEBFixture extends TokensFixture {
  impactEB: ImpactEB;
}

export const impactEBFixture: Fixture<ImpactEBFixture> = async function (
  [wallet, other, nebula],
  provider
): Promise<ImpactEBFixture> {
  const { token0, token1, token2 } = await tokensFixture();

  const impactEBFactory = await ethers.getContractFactory("ImpactEB");
  const impactEB = (await impactEBFactory.deploy(
    wallet.address,
    nebula.address,
    [token1.address, token2.address]
  )) as ImpactEB;
  return {
    token0,
    token1,
    token2,
    impactEB,
  };
};

interface FarmCurvedFixture {
  farm: MockTimeFarmCurved;
}

async function farmCurvedFixture(owner: string): Promise<FarmCurvedFixture> {
  const farmFactory = await ethers.getContractFactory("MockTimeFarmCurved");
  const farm = (await farmFactory.deploy(
    owner,
    EARLY_BIRDS_A,
    EARLY_BIRDS_C
  )) as MockTimeFarmCurved;
  return { farm };
}

interface FarmLinearFixture {
  farm: MockTimeFarmLinear;
}

async function farmLinearFixture(owner: string): Promise<FarmLinearFixture> {
  const farmFactory = await ethers.getContractFactory("MockTimeFarmLinear");
  const farm = (await farmFactory.deploy(
    owner,
    STAKING_AMOUNT,
    STAKING_PERIOD
  )) as MockTimeFarmLinear;
  return { farm };
}

interface BalanceKeeperFixture {
  balanceKeeper: BalanceKeeper;
}

async function balanceKeeperFixture(
  owner: string
): Promise<BalanceKeeperFixture> {
  const balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeper");
  const balanceKeeper = (await balanceKeeperFactory.deploy(
    owner
  )) as BalanceKeeper;
  return { balanceKeeper };
}

type FarmCurvedAndImpactEBAndBalanceKeeperFixture = FarmCurvedFixture &
  ImpactEBFixture &
  BalanceKeeperFixture;

interface BalanceAdderEBFixture extends FarmCurvedAndImpactEBAndBalanceKeeperFixture {
  balanceAdderEB: BalanceAdderEB;
}

export const balanceAdderEBFixture: Fixture<BalanceAdderEBFixture> = async function (
  [wallet, other, nebula],
  provider
): Promise<BalanceAdderEBFixture> {
  const { farm } = await farmCurvedFixture(wallet.address);
  const { token0, token1, token2, impactEB } = await impactEBFixture(
    [wallet, other, nebula],
    provider
  );
  const { balanceKeeper } = await balanceKeeperFixture(wallet.address);

  await impactEB
    .connect(nebula)
    .attachValue(makeValueImpact(token1.address, wallet.address, "1000", "0", "0"));
  await impactEB
    .connect(nebula)
    .attachValue(makeValueImpact(token2.address, other.address, "1000", "1", "0"));

  const balanceAdderEBFactory = await ethers.getContractFactory("BalanceAdderEB");
  const balanceAdderEB = (await balanceAdderEBFactory.deploy(
    farm.address,
    impactEB.address,
    balanceKeeper.address
  )) as BalanceAdderEB;
  return {
    farm,
    token0,
    token1,
    token2,
    impactEB,
    balanceKeeper,
    balanceAdderEB,
  };
};

interface VoterFixture extends BalanceKeeperFixture {
  voter: Voter;
}

export const voterFixture: Fixture<VoterFixture> = async function (
  [wallet, other],
  provider
): Promise<VoterFixture> {
  const { balanceKeeper } = await balanceKeeperFixture(wallet.address);

  const voterFactory = await ethers.getContractFactory("Voter");
  const voter = (await voterFactory.deploy(
    wallet.address,
    balanceKeeper.address
  )) as Voter;
  return {
    balanceKeeper,
    voter,
  };
};

type FarmLinearAndBalanceKeeperFixture = FarmLinearFixture & BalanceKeeperFixture;

interface BalanceAdderStakingFixture extends FarmLinearAndBalanceKeeperFixture {
  balanceAdderStaking: BalanceAdderStaking;
}

export const balanceAdderStakingFixture: Fixture<BalanceAdderStakingFixture> =
  async function ([wallet, other], provider): Promise<BalanceAdderStakingFixture> {
    const { balanceKeeper } = await balanceKeeperFixture(wallet.address);
    const { farm } = await farmLinearFixture(wallet.address);

    const balanceAdderStakingFactory = await ethers.getContractFactory(
      "BalanceAdderStaking"
    );
    const balanceAdderStaking = (await balanceAdderStakingFactory.deploy(
      farm.address,
      balanceKeeper.address
    )) as BalanceAdderStaking;
    return {
      farm,
      balanceKeeper,
      balanceAdderStaking,
    };
  };

interface LPKeeperFixture extends TokensFixture {
  lpKeeper: LPKeeper;
}

export const lpKeeperFixture: Fixture<LPKeeperFixture> =
  async function ([wallet, other], provider): Promise<LPKeeperFixture> {
    const { token0, token1, token2 } = await tokensFixture();
    const lpKeeperFactory = await ethers.getContractFactory(
      "LPKeeper"
    );
    const lpKeeper = (await lpKeeperFactory.deploy(
      wallet.address
    )) as LPKeeper;
    return {
      token0,
      token1,
      token2,
      lpKeeper,
    };
  };

type FarmCurvedAndBalanceKeeperAndLPKeeperFixture = FarmCurvedFixture & BalanceKeeperFixture & LPKeeperFixture;

interface BalanceAdderLPFixture extends FarmCurvedAndBalanceKeeperAndLPKeeperFixture {
  balanceAdderLP: BalanceAdderLP;
}

export const balanceAdderLPFixture: Fixture<BalanceAdderLPFixture> =
  async function ([wallet, other], provider): Promise<BalanceAdderLPFixture> {
    const { balanceKeeper } = await balanceKeeperFixture(wallet.address);
    const { token0, token1, token2, lpKeeper } = await lpKeeperFixture([wallet, other], provider);
    const { farm } = await farmCurvedFixture(wallet.address);

    const balanceAdderLPFactory = await ethers.getContractFactory(
      "BalanceAdderLP"
    );
    const balanceAdderLP = (await balanceAdderLPFactory.deploy(
      farm.address,
      balanceKeeper.address,
      lpKeeper.address
    )) as BalanceAdderLP;
    return {
      token0,
      token1,
      token2,
      farm,
      balanceKeeper,
      lpKeeper,
      balanceAdderLP,
    };
  };

type BalanceKeeperAndLPKeeperFixture = BalanceKeeperFixture & LPKeeperFixture

interface OracleRouterFixture extends BalanceKeeperAndLPKeeperFixture {
  oracleRouter: OracleRouter;
}

export const oracleRouterFixture: Fixture<OracleRouterFixture> =
  async function ([wallet, other], provider): Promise<OracleRouterFixture> {
    const { balanceKeeper } = await balanceKeeperFixture(wallet.address);
    const { token0, token1, token2, lpKeeper } = await lpKeeperFixture([wallet, other], provider);

    const oracleRouterFactory = await ethers.getContractFactory("OracleRouter");
    const oracleRouter = (await oracleRouterFactory.deploy(
      wallet.address,
      balanceKeeper.address,
      lpKeeper.address,
      GTON_ADD_TOPIC,
      GTON_SUB_TOPIC,
      __LP_ADD_TOPIC,
      __LP_SUB_TOPIC
    )) as OracleRouter;
    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      lpKeeper,
      oracleRouter
    };
  };

interface OracleParserFixture extends OracleRouterFixture {
  oracleParser: OracleParser;
}

export const oracleParserFixture: Fixture<OracleParserFixture> =
  async function ([wallet, other, nebula], provider): Promise<OracleParserFixture> {
    const { token0, token1, token2, balanceKeeper, lpKeeper, oracleRouter } = await oracleRouterFixture([wallet, other], provider);

    const oracleParserFactory = await ethers.getContractFactory("OracleParser");
    const oracleParser = (await oracleParserFactory.deploy(
      wallet.address,
      oracleRouter.address,
      nebula.address
    )) as OracleParser;
    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      lpKeeper,
      oracleRouter,
      oracleParser
    };
  };

type TokensAndVoterFixture = TokensFixture & VoterFixture

interface ClaimGTONFixture extends TokensAndVoterFixture {
  claimGTON: MockTimeClaimGTON;
}

export const claimGTONFixture: Fixture<ClaimGTONFixture> =
  async function ([wallet, other], provider): Promise<ClaimGTONFixture> {
    const { token0, token1, token2 } = await tokensFixture();
    const { balanceKeeper, voter } = await voterFixture([wallet, other], provider)

    const claimGTONFactory = await ethers.getContractFactory("MockTimeClaimGTON");
    const claimGTON = (await claimGTONFactory.deploy(
      wallet.address,
      token0.address,
      wallet.address,
      balanceKeeper.address,
      voter.address
    )) as MockTimeClaimGTON;
    return {
      token0,
      token1,
      token2,
      balanceKeeper,
      voter,
      claimGTON
    };
  };

interface BalanceKeeperV2Fixture {
  balanceKeeper: BalanceKeeperV2;
}

async function balanceKeeperV2Fixture(
  owner: string
): Promise<BalanceKeeperV2Fixture> {
  const balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeperV2");
  const balanceKeeper = (await balanceKeeperFactory.deploy(
    owner
  )) as BalanceKeeperV2;
  return { balanceKeeper };
}

interface VoterV2Fixture extends BalanceKeeperV2Fixture {
  voter: VoterV2;
}

export const voterV2Fixture: Fixture<VoterV2Fixture> = async function (
  [wallet, other],
  provider
): Promise<VoterV2Fixture> {
  const { balanceKeeper } = await balanceKeeperV2Fixture(wallet.address);

  const voterFactory = await ethers.getContractFactory("VoterV2");
  const voter = (await voterFactory.deploy(
    wallet.address,
    balanceKeeper.address
  )) as VoterV2;
  return {
    balanceKeeper,
    voter,
  };
};
