import { ethers, network } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("Farm", function () {
  let owner: Signer;
  let ownerAddress: string;
  let accounts: Signer[];

  let farmContract: Contract;
  let farmAddress: string;

  beforeEach(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();

    let farmFactory = await ethers.getContractFactory("FarmLinear");
    let _amount = 1000;
    let _period = 86400;
    farmContract = await farmFactory.deploy(ownerAddress, _amount, _period);
  });

  it("should unlock according to formula", async function () {
    await network.provider.send("evm_increaseTime", [31536000])

    await farmContract.startFarming();

    await network.provider.send("evm_increaseTime", [31536000])

    await farmContract.unlockAsset();
    let totalUnlockedBN = await farmContract.totalUnlocked();
    let totalUnlockedBN2 = totalUnlockedBN.div(ethers.BigNumber.from("1000000000000000000"));
    let totalUnlockedInt = parseInt(totalUnlockedBN2.toString());
    return expect(totalUnlockedInt).to.equal(365000);
  });

});
