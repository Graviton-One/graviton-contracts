import { ethers } from "hardhat";
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

  let balanceGTONContract: Contract;
  let balanceGTONAddress: string;

  let balanceLPContract: Contract;
  let balanceLPAddress: string;

  let oracleRouterContract: Contract;
  let oracleRouterAddress: string;

  beforeEach(async function () {
    [owner, receiver, nebula, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    receiverAddress = await receiver.getAddress();
    nebulaAddress = await nebula.getAddress();

    let balanceGTONFactory = await ethers.getContractFactory("BalanceKeeper");
    balanceGTONContract = await balanceGTONFactory.deploy(ownerAddress);
    balanceGTONAddress = balanceGTONContract.address;

    let balanceLPFactory = await ethers.getContractFactory("BalanceLP");
    balanceLPContract = await balanceLPFactory.deploy(ownerAddress);
    balanceLPAddress = balanceLPContract.address;

    let oracleRouterFactory = await ethers.getContractFactory("OracleRouter");
    let balanceGTONAddEventTopic = ethers.utils.arrayify("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
    let balanceGTONSubtractEventTopic = ethers.utils.arrayify("0x0000000000000000000000000000000000000000000000000000000000000000");
    let balanceLPAddEventTopic = ethers.utils.arrayify("0x0000000000000000000000000000000000000000000000000000000000000000");
    let balanceLPSubtractEventTopic = ethers.utils.arrayify("0x0000000000000000000000000000000000000000000000000000000000000000");
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
    let topic0 = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    let topic1 = "0x7d88a5c39059899a8d7e59eb5c5c9b78c0180652";
    let topic2 = "0x0a98fb70939162725ae66e626fe4b52cff62c2e5";
    let receiverAddr = "0x0a98fb70939162725ae66e626fe4b52cff62c2e5";
    let amount = "776800000";
    let amountInt = 776800000;

    await oracleRouterContract.routeValue(uuid,
                                          chain,
                                          emiter,
                                          topic0,
                                          topic1,
                                          topic2,
                                          amount);

    let balanceBN = await balanceGTONContract.userBalance(receiverAddr);
    let balanceInt = parseInt(balanceBN.toString());

    expect(balanceInt).to.equal(amountInt)
  });

});
