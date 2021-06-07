import { ethers, network } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;
import {v5 as uuidv5} from 'uuid';

describe("Contracts for locking and farming LP", function () {
  let owner: Signer;
  let ownerAddress: string;

  let nebula: Signer;
  let nebulaAddress: string;

  let alice: Signer;
  let aliceAddress: string;

  let bob: Signer;
  let bobAddress: string;

  let accounts: Signer[];

  let balanceGTONContract: Contract;
  let balanceGTONAddress: string;

  let farmContract: Contract;
  let farmAddress: string;

  let balanceLPContract: Contract;
  let balanceLPAddress: string;

  let gtonContract: Contract;
  let gtonAddress: string;

  let crosschainLockGTONContract: Contract;
  let crosschainLockGTONAddress: string;

  let lpContract: Contract;
  let lpAddress: string;

  let crosschainLockLPContract: Contract;
  let crosschainLockLPAddress: string;

  let oracleRouterContract: Contract;
  let oracleRouterAddress: string;

  let oracleParserContract: Contract;
  let oracleParserAddress: string;

  let gtonAddTopic = "0x0000000000000000000000000000000000000000000000000000000000000001";
  let gtonSubTopic = "0x0000000000000000000000000000000000000000000000000000000000000002";
  let lp__AddTopic = "0x0000000000000000000000000000000000000000000000000000000000000003";
  let lp__SubTopic = "0x0000000000000000000000000000000000000000000000000000000000000004";

  beforeEach(async function () {
    [owner, nebula, alice, bob, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    nebulaAddress = await nebula.getAddress();
    aliceAddress = await alice.getAddress();
    bobAddress = await bob.getAddress();

    let balanceGTONFactory = await ethers.getContractFactory("BalanceKeeper");
    balanceGTONContract = await balanceGTONFactory.deploy(ownerAddress);
    balanceGTONAddress = balanceGTONContract.address;

    let farmFactory = await ethers.getContractFactory("Farm");
    let _a = 26499999999995;
    let _c = 2100000;
    farmContract = await farmFactory.deploy(ownerAddress, _a, _c);
    farmAddress = farmContract.address;

    let balanceLPFactory = await ethers.getContractFactory("BalanceLP");
    balanceLPContract = await balanceLPFactory.deploy(ownerAddress, farmAddress, balanceGTONAddress);
    balanceLPAddress = balanceLPContract.address;

    let lpFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    lpContract = await lpFactory.deploy("LP", "LP");
    lpAddress = lpContract.address;

    let crosschainLockLPFactory = await ethers.getContractFactory("CrosschainLockLP");
    crosschainLockLPContract = await crosschainLockLPFactory.deploy(ownerAddress, [lpAddress]);
    crosschainLockLPAddress = crosschainLockLPContract.address;

    let oracleRouterFactory = await ethers.getContractFactory("OracleRouter");
    oracleRouterContract = await oracleRouterFactory.deploy(ownerAddress,
                                                            balanceGTONAddress,
                                                            balanceLPAddress,
                                                            gtonAddTopic,
                                                            gtonSubTopic,
                                                            lp__AddTopic,
                                                            lp__SubTopic
                                                           );
    oracleRouterAddress = oracleRouterContract.address;

    let oracleParserFactory = await ethers.getContractFactory("OracleParser");
    oracleParserContract = await oracleParserFactory.deploy(ownerAddress, oracleRouterAddress, nebulaAddress);
    oracleParserAddress = oracleParserContract.address;
  });

  it("should lock and add lp", async function () {

    let amount = 100;
    let amountBN = ethers.BigNumber.from(amount.toString());

    lpContract = lpContract.connect(owner);
    await lpContract.mint(aliceAddress, amount);

    lpContract = lpContract.connect(alice);
    await lpContract.approve(crosschainLockLPAddress, amount);

    crosschainLockLPContract = crosschainLockLPContract.connect(alice);
    await expect(crosschainLockLPContract.lockTokens(lpAddress, bobAddress, amount))
      .to.emit(crosschainLockLPContract, 'LockLPEvent')
      .withArgs(lpAddress, aliceAddress, bobAddress, amount);

    // mock extractor data format
    let uuid       = "0x5ae47235f0844e55b26703b7cf385294";
    let chainStr   = "ETH";
    let chainBytes = "0x455448"
    let emiter     = crosschainLockLPAddress;
    let topic0     = lp__AddTopic;
    let token32    = ethers.utils.hexZeroPad(lpAddress, 32);
    let sender32   = ethers.utils.hexZeroPad(aliceAddress, 32);
    let receiver32 = ethers.utils.hexZeroPad(bobAddress, 32);
    let amount32   = ethers.utils.hexZeroPad(amountBN.toHexString(), 32);

    let attachValue = ethers.utils.concat([ethers.utils.arrayify(uuid)
                                          ,ethers.utils.arrayify(chainBytes)
                                          ,ethers.utils.arrayify(emiter)
                                          ,ethers.utils.arrayify(topic0)
                                          ,ethers.utils.arrayify(token32)
                                          ,ethers.utils.arrayify(sender32)
                                          ,ethers.utils.arrayify(receiver32)
                                          ,ethers.utils.arrayify(amount32)]);

    balanceLPContract = balanceLPContract.connect(owner);
    await balanceLPContract.toggleAdder(oracleRouterAddress);
    oracleRouterContract = oracleRouterContract.connect(owner);
    await oracleRouterContract.toggleParser(oracleParserAddress)

    oracleParserContract = oracleParserContract.connect(nebula);
    await expect(oracleParserContract.attachValue(attachValue))
      .to.emit(oracleParserContract, 'AttachValueEvent')
      .withArgs(nebulaAddress,
                uuid,
                chainStr,
                emiter,
                topic0,
                lpAddress,
                aliceAddress,
                bobAddress,
                amountBN.toString());

    let balanceLPBN = await balanceLPContract.userBalance(lpAddress, bobAddress);
    let balanceLPInt = parseInt(balanceLPBN.toString());

    await expect(balanceLPInt).to.equal(amount);

    farmContract = farmContract.connect(owner);
    await farmContract.startFarming();
    await network.provider.send("evm_increaseTime", [3600]);
    await farmContract.unlockAsset();

    balanceGTONContract = balanceGTONContract.connect(owner);
    await balanceGTONContract.toggleAdder(balanceLPAddress);

    await balanceLPContract.processBalances(50);

    let balanceGTONBN = await balanceGTONContract.userBalance(bobAddress);
    let balanceGTONInt = parseInt(balanceGTONBN.toString());
    return expect(balanceGTONInt).to.be.gt(0);

  });

  it("should unlock and subtract lp", async function () {

    let lockAmount = 100;
    let lockAmountBN = ethers.BigNumber.from(lockAmount.toString());
    let unlockAmount = 50;
    let unlockAmountBN = ethers.BigNumber.from(unlockAmount.toString());

    lpContract = lpContract.connect(owner);
    await lpContract.mint(aliceAddress, lockAmount);

    lpContract = lpContract.connect(alice);
    await lpContract.approve(crosschainLockLPAddress, lockAmount);

    crosschainLockLPContract = crosschainLockLPContract.connect(alice);
    await crosschainLockLPContract.lockTokens(lpAddress, bobAddress, lockAmount);

    // skip extractor, mock result of adding lockAmount to balanceLP
    await balanceLPContract.toggleAdder(ownerAddress);
    await balanceLPContract.addTokens(lpAddress, bobAddress, lockAmount);

    let value = await balanceLPContract.userBalance(lpAddress, bobAddress);
    await expect(value).to.equal(lockAmount);

    crosschainLockLPContract = crosschainLockLPContract.connect(bob);
    await expect(crosschainLockLPContract.unlockTokens(lpAddress, aliceAddress, unlockAmount))
      .to.emit(crosschainLockLPContract, 'UnlockLPEvent')
      .withArgs(lpAddress, bobAddress, aliceAddress, unlockAmount);

    // mock extractor data format
    let uuid       = "0x5ae47235f0844e55b26703b7cf385294";
    let chainStr   = "ETH";
    let chainBytes = "0x455448"
    let emiter     = crosschainLockLPAddress;
    let topic0     = lp__SubTopic;
    let token32    = ethers.utils.hexZeroPad(lpAddress, 32);
    let sender32   = ethers.utils.hexZeroPad(bobAddress, 32);
    let receiver32 = ethers.utils.hexZeroPad(aliceAddress, 32);
    let amount32   = ethers.utils.hexZeroPad(unlockAmountBN.toHexString(), 32);

    let attachValue = ethers.utils.concat([ethers.utils.arrayify(uuid)
                                          ,ethers.utils.arrayify(chainBytes)
                                          ,ethers.utils.arrayify(emiter)
                                          ,ethers.utils.arrayify(topic0)
                                          ,ethers.utils.arrayify(token32)
                                          ,ethers.utils.arrayify(sender32)
                                          ,ethers.utils.arrayify(receiver32)
                                          ,ethers.utils.arrayify(amount32)]);

    balanceLPContract = balanceLPContract.connect(owner);
    await balanceLPContract.toggleSubtractor(oracleRouterAddress);
    oracleRouterContract = oracleRouterContract.connect(owner);
    await oracleRouterContract.toggleParser(oracleParserAddress);

    oracleParserContract = oracleParserContract.connect(nebula);
    await expect(oracleParserContract.attachValue(attachValue))
      .to.emit(oracleParserContract, 'AttachValueEvent')
      .withArgs(nebulaAddress,
                uuid,
                chainStr,
                emiter,
                topic0,
                lpAddress,
                bobAddress,
                aliceAddress,
                unlockAmountBN.toString());

    let balanceLPBN = await balanceLPContract.userBalance(lpAddress, bobAddress);
    let balanceLPInt = parseInt(balanceLPBN.toString());

    await expect(balanceLPInt).to.equal(lockAmount - unlockAmount);
  });

});
