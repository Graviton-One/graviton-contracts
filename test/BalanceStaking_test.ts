import { ethers, network } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("BalanceStaking", function () {
  let owner: Signer;
  let ownerAddress: string;
  let other: Signer;
  let otherAddress: string;
  let accounts: Signer[];

  let balanceKeeperContract: Contract;
  let balanceKeeperAddress: string;

  let farmStakingContract: Contract;
  let farmStakingAddress: string;

  let balanceStakingContract: Contract;
  let balanceStakingAddress: string;

  beforeEach(async function () {
    [owner, other, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    otherAddress = await other.getAddress();

    let balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeper");
    balanceKeeperContract = await balanceKeeperFactory.deploy(ownerAddress);
    balanceKeeperAddress = balanceKeeperContract.address;

    let farmStakingFactory = await ethers.getContractFactory("Farm");
    let _a = 26499999999995;
    let _c = 2100000;
    farmStakingContract = await farmStakingFactory.deploy(ownerAddress, _a, _c);
    farmStakingAddress = farmStakingContract.address;

    let balanceStakingFactory = await ethers.getContractFactory("BalanceStaking");
    balanceStakingContract = await balanceStakingFactory.deploy(ownerAddress, farmStakingAddress, balanceKeeperAddress);
    balanceStakingAddress = balanceStakingContract.address;
  });

  it("should processBalances", async function () {

    // start staking farm
    await farmStakingContract.startFarming();
    await network.provider.send("evm_increaseTime", [3600]);
    await farmStakingContract.unlockAsset();

    // add balance
    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 3);

    // process staking
    await balanceKeeperContract.toggleAdder(balanceStakingAddress);
    await balanceStakingContract.processBalances(1);

    let balance = await balanceKeeperContract.userBalance(ownerAddress);

    return expect(parseInt(balance.toString())).to.be.gt(3);

  });
  describe("linear staking", function () {
    beforeEach(async function () {
      let farmStakingFactory = await ethers.getContractFactory("FarmLinear");
      let _amount = 1000;
      let _period = 86400;
      farmStakingContract = await farmStakingFactory.deploy(ownerAddress, _amount, _period);
      farmStakingAddress = farmStakingContract.address;

      let balanceStakingFactory = await ethers.getContractFactory("BalanceStaking");
      balanceStakingContract = await balanceStakingFactory.deploy(ownerAddress, farmStakingAddress, balanceKeeperAddress);
      balanceStakingAddress = balanceStakingContract.address;
    });
    it("should processBalances", async function () {

       // add balance
       await balanceKeeperContract.toggleAdder(ownerAddress);
       await balanceKeeperContract.addValue(ownerAddress,  "13391533244156814473777");
       await balanceKeeperContract.addValue(otherAddress, "440127762920681987591205");

       // start staking farm
       await farmStakingContract.startFarming();
       await network.provider.send("evm_increaseTime", [86400]);
       await farmStakingContract.unlockAsset();

       // process staking
       await balanceKeeperContract.toggleAdder(balanceStakingAddress);
       await balanceStakingContract.processBalances(2);

       let balance = await balanceKeeperContract.userBalance(ownerAddress);
       expect(balance).to.be.eq("13421061278261209998117");

       await network.provider.send("evm_increaseTime", [86400]);
       await farmStakingContract.unlockAsset();

       await balanceStakingContract.processBalances(2);

       balance = await balanceKeeperContract.userBalance(ownerAddress);
       expect(balance).to.be.eq("13450589995884913494576");
    });
  });
});
