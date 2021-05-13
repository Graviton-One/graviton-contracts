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

    let farmFactory = await ethers.getContractFactory("Farm");
    let _a = 26499999999995;
    let _c = 2100000;
    farmContract = await farmFactory.deploy(ownerAddress, _a, _c);
  });

  it("should unlock according to formula", async function () {
    await farmContract.startFarming();

    await network.provider.send("evm_increaseTime", [31536000])

    await farmContract.unlockAsset();
    let totalUnlockedBN: string = await farmContract.totalUnlocked();
    let totalUnlockedStr = totalUnlockedBN.toString().slice(0, 7);
    let totalUnlockedInt = parseInt(totalUnlockedStr)
    expect(totalUnlockedInt).to.be.within(1499840,1499850);

  });

});
