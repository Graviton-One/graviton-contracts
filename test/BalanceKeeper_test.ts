import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("BalanceKeeper", function () {
  let owner: Signer;
  let ownerAddress: string;
  let accounts: Signer[];

  let balanceKeeperContract: Contract;

  beforeEach(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();

    let balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeper");
    balanceKeeperContract = await balanceKeeperFactory.deploy(ownerAddress);
  });

  it("should add value", async function () {
    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 1);
    let value = await balanceKeeperContract.userBalance(ownerAddress);
    expect(value).to.equal(1);
  });

  it("should not subtract value from 0", async function () {
    await balanceKeeperContract.toggleSubtractor(ownerAddress);
    return expect(balanceKeeperContract.subtractValue(ownerAddress, 1)).to.be
      .rejected;
  });

  it("should subtract value", async function () {
    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 2);

    await balanceKeeperContract.toggleSubtractor(ownerAddress);
    await balanceKeeperContract.subtractValue(ownerAddress, 1);
    let value = await balanceKeeperContract.userBalance(ownerAddress);
    expect(value).to.equal(1);
  });
});
