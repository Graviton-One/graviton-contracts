import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("BirdsImpact", function () {

  let owner: Signer;
  let ownerAddress: string;
  let accounts: Signer[];

  let farmEBContract: Contract;
  let farmEBAddress: string;

  let impactEBContract: Contract;

  let depositer: Signer;
  let depositerAddress: string;
  let lockTokenAddress: string;

  let amount: number = 1000;

  beforeEach(async function () {
    [owner, depositer, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    depositerAddress = await depositer.getAddress();

    let farmEBFactory = await ethers.getContractFactory("Farm");
    let _a = 26499999999995;
    let _c = 2100000;
    farmEBContract = await farmEBFactory.deploy(ownerAddress, _a, _c);
    farmEBAddress = farmEBContract.address;

    let governanceTokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    let governanceTokenContract = await governanceTokenFactory.deploy("name", "symbol");
    let governanceTokenAddress = governanceTokenContract.address;

    let lockTokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    let lockTokenContract = await lockTokenFactory.deploy("name", "symbol");
    lockTokenAddress = lockTokenContract.address;

    let impactEBFactory = await ethers.getContractFactory("BirdsImpact");
    let _nebula: string = ownerAddress
    let _allowedTokens: string[] = [lockTokenAddress]
    let _governanceTokenAddr: string = governanceTokenAddress
    impactEBContract = await impactEBFactory.deploy(ownerAddress, _nebula, _allowedTokens, _governanceTokenAddr, farmEBAddress);
  });

  it("should attach value", async function () {

    let lockTokenBytes = ethers.utils.arrayify(lockTokenAddress);
    let depositerBytes = ethers.utils.arrayify(depositerAddress);
    let amountBytes    = ethers.utils.hexZeroPad(ethers.BigNumber.from(amount.toString()).toHexString(),32);
    let idBytes        = ethers.utils.hexZeroPad(ethers.BigNumber.from("0").toHexString(),32);
    let actionBytes    = ethers.utils.hexZeroPad(ethers.BigNumber.from("0").toHexString(),32);

    let attachValue    = ethers.utils.concat([lockTokenBytes,depositerBytes,amountBytes,idBytes,actionBytes])

    await impactEBContract.attachValue(attachValue);
    let impactBN = await impactEBContract.impact(depositerAddress);
    let impactInt = parseInt(impactBN.toString())
    expect(impactInt).to.equal(amount)

  });

});
