import { ethers, network } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("BalanceLP", function () {
  let owner: Signer;
  let ownerAddress: string;
  let accounts: Signer[];

  let tokenContract: Contract;
  let tokenAddress: string;

  let balanceGTONContract: Contract;
  let balanceGTONAddress: string;

  let farmContract: Contract;
  let farmAddress: string;

  let balanceLPContract: Contract;
  let balanceLPAddress: string;

  beforeEach(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();

    let tokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    tokenContract = await tokenFactory.deploy("TOKEN", "TOKEN");
    tokenAddress = tokenContract.address;

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

  });

  it("should add value", async function () {
    await balanceLPContract.toggleAdder(ownerAddress);
    await balanceLPContract.addTokens(tokenAddress, ownerAddress, 1);
    let value = await balanceLPContract.userBalance(tokenAddress, ownerAddress);
    expect(value).to.equal(1);
  });

  it("should not subtract value from 0", async function () {
    await balanceLPContract.toggleSubtractor(ownerAddress);
    return expect(balanceLPContract.subtractTokens(tokenAddress, ownerAddress, 1)).to.be
      .rejected;
  });

  it("should subtract value", async function () {
    await balanceLPContract.toggleAdder(ownerAddress);
    await balanceLPContract.addTokens(tokenAddress, ownerAddress, 2);

    await balanceLPContract.toggleSubtractor(ownerAddress);
    await balanceLPContract.subtractTokens(tokenAddress, ownerAddress, 1);
    let value = await balanceLPContract.userBalance(tokenAddress, ownerAddress);
    expect(value).to.equal(1);
  });

  it("should process balances", async function () {
    await balanceLPContract.toggleAdder(ownerAddress);
    await balanceLPContract.addTokens(tokenAddress, ownerAddress, 1);

    let count = await balanceLPContract.userCount(tokenAddress);
    let user = await balanceLPContract.userIndex(tokenAddress, 0);

    await farmContract.startFarming();
    await network.provider.send("evm_increaseTime", [3600]);
    await farmContract.unlockAsset();

    await balanceGTONContract.toggleAdder(balanceLPAddress);

    await balanceLPContract.processBalances(50);

    let value = await balanceGTONContract.userBalance(ownerAddress);

    return expect(value).to.be.gt(0);
  });
});
