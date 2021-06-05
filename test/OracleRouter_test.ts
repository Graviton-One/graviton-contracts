import { ethers, network } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("OracleRouter", function () {
  let owner: Signer;
  let ownerAddress: string;
  let receiver: Signer;
  let receiverAddress: string;
  let nebula: Signer;
  let nebulaAddress: string;
  let accounts: Signer[];

  let farmContract: Contract;
  let farmAddress: string;

  let balanceGTONContract: Contract;
  let balanceGTONAddress: string;

  let balanceLPContract: Contract;
  let balanceLPAddress: string;

  let oracleRouterContract: Contract;
  let oracleRouterAddress: string;

  let balanceGTONAddEventTopic      = "0x0000000000000000000000000000000000000000000000000000000000000001";
  let balanceGTONSubtractEventTopic = "0x0000000000000000000000000000000000000000000000000000000000000002";
  let balanceLPAddEventTopic        = "0x0000000000000000000000000000000000000000000000000000000000000003";
  let balanceLPSubtractEventTopic   = "0x0000000000000000000000000000000000000000000000000000000000000004";

  beforeEach(async function () {
    [owner, receiver, nebula, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    receiverAddress = await receiver.getAddress();
    nebulaAddress = await nebula.getAddress();

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

    let oracleRouterFactory = await ethers.getContractFactory("OracleRouter");
    oracleRouterContract = await oracleRouterFactory.deploy(ownerAddress,
                                                            balanceGTONAddress,
                                                            balanceLPAddress,
                                                            balanceGTONAddEventTopic,
                                                            balanceGTONSubtractEventTopic,
                                                            balanceLPAddEventTopic,
                                                            balanceLPSubtractEventTopic
                                                           );
    oracleRouterAddress = oracleRouterContract.address;

  });

  it("should route to add GTON", async function () {

    await balanceGTONContract.toggleAdder(oracleRouterAddress);

    let uuid = "0x5ae47235f0844e55b26703b7cf385294";
    let chain = "ETH";
    let emiter = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    let topic0 = balanceGTONAddEventTopic;
    let topic1 = "0x7d88a5c39059899a8d7e59eb5c5c9b78c0180652";
    let topic2 = "0x0a98fb70939162725ae66e626fe4b52cff62c2e5";
    let topic3 = "0x0a98fb70939162725ae66e626fe4b52cff62c2e5";
    let receiverAddr = "0x0a98fb70939162725ae66e626fe4b52cff62c2e5";
    let amount = "776800000";
    let amountInt = 776800000;

    await oracleRouterContract.routeValue(uuid,
                                          chain,
                                          emiter,
                                          topic0,
                                          topic1,
                                          topic2,
                                          topic3,
                                          amount);

    let balanceBN = await balanceGTONContract.userBalance(receiverAddr);
    let balanceInt = parseInt(balanceBN.toString());

    expect(balanceInt).to.equal(amountInt)
  });

  it("should route to add LP", async function () {

    await balanceLPContract.toggleAdder(oracleRouterAddress);

    let uuid      = "0x5ae47235f0844e55b26703b7cf385294";
    let chain     = "ETH";
    let emiter    = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    let topic0    = balanceLPAddEventTopic;
    let token     = "0x7d88a5c39059899a8d7e59eb5c5c9b78c0180652";
    let sender    = "0x0a98fb70939162725ae66e626fe4b52cff62c2e5";
    let receiver  = "0x0a98fb70939162725ae66e626fe4b52cff62c2e5";
    let amountStr = "776800000";
    let amountInt = 776800000;

    await oracleRouterContract.routeValue(uuid,
                                          chain,
                                          emiter,
                                          topic0,
                                          token,
                                          sender,
                                          receiver,
                                          amountStr);

    let balanceBN = await balanceLPContract.userBalance(token, receiver);
    let balanceInt = parseInt(balanceBN.toString());

    // expect(balanceInt).to.equal(amountInt)
    await farmContract.startFarming();
    await network.provider.send("evm_increaseTime", [3600]);
    await farmContract.unlockAsset();

    await balanceGTONContract.toggleAdder(balanceLPAddress);

    await balanceLPContract.processBalances(token, 50);

    let value = await balanceGTONContract.userBalance(receiver);
    console.log(value);

  });
});
