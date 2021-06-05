import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("OracleParser", function () {
  let owner: Signer;
  let ownerAddress: string;
  let receiver: Signer;
  let receiverAddress: string;
  let nebula: Signer;
  let nebulaAddress: string;
  let accounts: Signer[];

  let oracleRouterContract: Contract;
  let oracleRouterAddress: string;

  let oracleParserContract: Contract;
  let oracleParserAddress: string;

  beforeEach(async function () {
    [owner, receiver, nebula, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    receiverAddress = await receiver.getAddress();
    nebulaAddress = await nebula.getAddress();

    let oracleRouterFactory = await ethers.getContractFactory("OracleRouterMock");
    oracleRouterContract = await oracleRouterFactory.deploy();
    oracleRouterAddress = oracleRouterContract.address;

    let oracleParserFactory = await ethers.getContractFactory("OracleParser");
    oracleParserContract = await oracleParserFactory.deploy(ownerAddress, oracleRouterAddress, nebulaAddress);
    oracleParserAddress = oracleParserContract.address;

  });

  it("should emit event", async function () {

    let uuid = "0x5ae47235f0844e55b26703b7cf385294"
    let chain = "0x455448"
    let chainStr = "ETH"
    let emiter = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    let topic0 = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    let topic1 = "0x0000000000000000000000007d88a5c39059899a8d7e59eb5c5c9b78c0180652"
    let addr1 = "0x7D88a5C39059899a8D7E59EB5c5C9b78C0180652"
    let topic2 = "0x0000000000000000000000000a98fb70939162725ae66e626fe4b52cff62c2e5"
    let addr2 = "0x0A98fB70939162725aE66E626Fe4b52cFF62c2e5"
    let amount = "0x000000000000000000000000000000000000000000000000000000002e4d0700"
    let amountInt = "776800000"

    let uuidBytes  = ethers.utils.arrayify(uuid);
    let chainBytes = ethers.utils.arrayify(chain);
    let emiterBytes = ethers.utils.arrayify(emiter);
    let topic0Bytes = ethers.utils.arrayify(topic0);
    let topic1Bytes = ethers.utils.arrayify(topic1);
    let topic2Bytes = ethers.utils.arrayify(topic2);
    let amountBytes = ethers.utils.arrayify(amount);

    let attachValue = ethers.utils.concat([uuidBytes
                                          ,chainBytes
                                          ,emiterBytes
                                          ,topic0Bytes
                                          ,topic1Bytes
                                          ,topic2Bytes
                                          ,amountBytes]);

    oracleParserContract = oracleParserContract.connect(nebula);
    await expect(oracleParserContract.attachValue(attachValue))
      .to.emit(oracleParserContract, 'AttachValueEvent')
      .withArgs(nebulaAddress,
                uuid,
                chainStr,
                emiter,
                topic0,
                addr1,
                addr2,
                amountInt);
  });

});
