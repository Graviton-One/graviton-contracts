import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;
import {v5 as uuidv5} from 'uuid';

describe("Contracts for locking GTON", function () {
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
    balanceLPContract = await balanceLPFactory.deploy(ownerAddress,
                                                      farmAddress,
                                                      balanceGTONAddress);
    balanceLPAddress = balanceLPContract.address;

    let gtonFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    gtonContract = await gtonFactory.deploy("GTON", "GTON");
    gtonAddress = gtonContract.address;

    let crosschainLockGTONFactory = await ethers.getContractFactory("CrosschainLockGTON");
    crosschainLockGTONContract = await crosschainLockGTONFactory.deploy(ownerAddress,
                                                                        gtonAddress);
    crosschainLockGTONAddress = crosschainLockGTONContract.address;

    let lpFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    lpContract = await lpFactory.deploy("LP", "LP");
    lpAddress = lpContract.address;

    let crosschainLockLPFactory = await ethers.getContractFactory("CrosschainLockLP");
    crosschainLockLPContract = await crosschainLockLPFactory.deploy(ownerAddress,
                                                                    [lpAddress]);
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

  it("should add gton", async function () {

    let amount = 1;
    let amountBN = ethers.BigNumber.from(amount.toString());

    crosschainLockGTONContract = crosschainLockGTONContract.connect(owner);
    await crosschainLockGTONContract.toggleLock();

    gtonContract = gtonContract.connect(owner);
    await gtonContract.mint(aliceAddress, amount);

    gtonContract = gtonContract.connect(alice);
    await gtonContract.approve(crosschainLockGTONAddress, amount);

    crosschainLockGTONContract = crosschainLockGTONContract.connect(alice);
    await expect(crosschainLockGTONContract.lockTokens(bobAddress, amount))
      .to.emit(crosschainLockGTONContract, 'LockGTONEvent')
      .withArgs(gtonAddress, aliceAddress, bobAddress, amount);

    // mock extractor data format
    let topics     = "0x04"
    let uuid       = "0x5ae47235f0844e55b26703b7cf385294";
    let chainStr   = "ETH";
    let chainBytes = "0x455448"
    let emiter     = crosschainLockGTONAddress;
    let topic0     = gtonAddTopic;
    let token32    = ethers.utils.hexZeroPad(gtonAddress, 32);
    let sender32   = ethers.utils.hexZeroPad(aliceAddress, 32);
    let receiver32 = ethers.utils.hexZeroPad(bobAddress, 32);
    let amount32   = ethers.utils.hexZeroPad(amountBN.toHexString(), 32);

    let attachValue = ethers.utils.concat([ethers.utils.arrayify(topics)
                                          ,ethers.utils.arrayify(uuid)
                                          ,ethers.utils.arrayify(chainBytes)
                                          ,ethers.utils.arrayify(emiter)
                                          ,ethers.utils.arrayify(topic0)
                                          ,ethers.utils.arrayify(token32)
                                          ,ethers.utils.arrayify(sender32)
                                          ,ethers.utils.arrayify(receiver32)
                                          ,ethers.utils.arrayify(amount32)]);

    balanceGTONContract = balanceGTONContract.connect(owner);
    await balanceGTONContract.toggleAdder(oracleRouterAddress);
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
                gtonAddress,
                aliceAddress,
                bobAddress,
                amountBN.toString());

    let balanceBN = await balanceGTONContract.userBalance(bobAddress);
    let balanceInt = parseInt(balanceBN.toString());

    return expect(balanceInt).to.equal(amount);

  });

});
