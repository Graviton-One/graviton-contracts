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
import { BalanceKeeperLP } from "../../typechain/BalanceKeeperLP";
import { OracleRouter } from "../../typechain/OracleRouter";
import { OracleParser } from "../../typechain/OracleParser";
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

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_FARM_START_TIME = 1601906400;

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

interface BalanceKeeperLPFixture extends TokensFixture {
  balanceKeeperLP: BalanceKeeperLP;
}

export const balanceKeeperLPFixture: Fixture<BalanceKeeperLPFixture> =
  async function ([wallet, other], provider): Promise<BalanceKeeperLPFixture> {
    const { token0, token1, token2 } = await tokensFixture();
    const balanceKeeperLPFactory = await ethers.getContractFactory(
      "BalanceKeeperLP"
    );
    const balanceKeeperLP = (await balanceKeeperLPFactory.deploy(
      wallet.address
    )) as BalanceKeeperLP;
    return {
      token0,
      token1,
      token2,
      balanceKeeperLP,
    };
  };

type FarmCurvedAndBalanceKeeperAndBalanceKeeperLPFixture = FarmCurvedFixture & BalanceKeeperFixture & BalanceKeeperLPFixture;

interface BalanceAdderLPFixture extends FarmCurvedAndBalanceKeeperAndBalanceKeeperLPFixture {
  balanceAdderLP: BalanceAdderLP;
}

export const balanceAdderLPFixture: Fixture<BalanceAdderLPFixture> =
  async function ([wallet, other], provider): Promise<BalanceAdderLPFixture> {
    const { balanceKeeper } = await balanceKeeperFixture(wallet.address);
    const { token0, token1, token2, balanceKeeperLP } = await balanceKeeperLPFixture([wallet, other], provider);
    const { farm } = await farmCurvedFixture(wallet.address);

    const balanceAdderLPFactory = await ethers.getContractFactory(
      "BalanceAdderLP"
    );
    const balanceAdderLP = (await balanceAdderLPFactory.deploy(
      farm.address,
      balanceKeeper.address,
      balanceKeeperLP.address
    )) as BalanceAdderLP;
    return {
      token0,
      token1,
      token2,
      farm,
      balanceKeeper,
      balanceKeeperLP,
      balanceAdderLP,
    };
  };

type BalanceKeeperAndBalanceKeeperLPFixture = BalanceKeeperFixture & BalanceKeeperLPFixture

interface OracleRouterFixture extends BalanceKeeperAndBalanceKeeperLPFixture {
  oracleRouter: OracleRouter;
}

export const oracleRouterFixture: Fixture<OracleRouterFixture> =
  async function ([wallet, other], provider): Promise<OracleRouterFixture> {
    const { balanceKeeper } = await balanceKeeperFixture(wallet.address);
    const { token0, token1, token2, balanceKeeperLP } = await balanceKeeperLPFixture([wallet, other], provider);

    const oracleRouterFactory = await ethers.getContractFactory("OracleRouter");
    const oracleRouter = (await oracleRouterFactory.deploy(
      wallet.address,
      balanceKeeper.address,
      balanceKeeperLP.address,
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
      balanceKeeperLP,
      oracleRouter
    };
  };

interface OracleParserFixture extends OracleRouterFixture {
  oracleParser: OracleParser;
}

export const oracleParserFixture: Fixture<OracleParserFixture> =
  async function ([wallet, other, nebula], provider): Promise<OracleParserFixture> {
    const { token0, token1, token2, balanceKeeper, balanceKeeperLP, oracleRouter } = await oracleRouterFixture([wallet, other], provider);

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
      balanceKeeperLP,
      oracleRouter,
      oracleParser
    };
  };
