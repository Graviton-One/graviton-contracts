import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("PortGTON", function () {
  let owner: Signer;
  let ownerAddress: string;
  let accounts: Signer[];

  let balanceKeeperContract: Contract;
  let balanceKeeperAddress: string;

  let tokenContract: Contract;
  let tokenAddress: string;

  let voterContract: Contract;
  let voterAddress: string;

  let portGTONContract: Contract;
  let portGTONAddress: string;

  beforeEach(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();

    let balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeper");
    balanceKeeperContract = await balanceKeeperFactory.deploy(ownerAddress);
    balanceKeeperAddress = balanceKeeperContract.address;

    let tokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    tokenContract = await tokenFactory.deploy("test", "test");
    tokenAddress = tokenContract.address;

    let voterFactory = await ethers.getContractFactory("Voter");
    voterContract = await voterFactory.deploy(ownerAddress, balanceKeeperAddress);
    voterAddress = voterContract.address;

    let portGTONFactory = await ethers.getContractFactory("PortGTON");
    portGTONContract = await portGTONFactory.deploy(ownerAddress, tokenAddress, balanceKeeperAddress, [voterAddress]);
    portGTONAddress = portGTONContract.address;

  });

  it("should lock tokens", async function () {

    let lockAmount = 1;

    await tokenContract.mint(ownerAddress, lockAmount);
    await tokenContract.approve(portGTONAddress, lockAmount);

    await portGTONContract.toggleLock();

    await balanceKeeperContract.toggleAdder(portGTONAddress)
    await portGTONContract.lockTokens(lockAmount);

    let balanceBN = await balanceKeeperContract.userBalance(ownerAddress);
    let balanceInt = parseInt(balanceBN.toString())

    expect(balanceInt).to.equal(1)
  });


  it("should unlock tokens", async function () {

    let lockAmount = 2;

    await tokenContract.mint(ownerAddress, lockAmount);
    await tokenContract.approve(portGTONAddress, lockAmount);

    await portGTONContract.toggleLock();

    await balanceKeeperContract.toggleAdder(portGTONAddress)
    await portGTONContract.lockTokens(lockAmount);

    let unlockAmount = 1;

    await portGTONContract.toggleUnlock();
    await balanceKeeperContract.toggleSubtractor(portGTONAddress);
    await voterContract.toggleVoteBalanceChecker(portGTONAddress);

    await portGTONContract.unlockTokens(unlockAmount, ownerAddress);

    let balanceBN = await balanceKeeperContract.userBalance(ownerAddress);
    let balanceInt = parseInt(balanceBN.toString())

    expect(balanceInt).to.equal(1)
  });

  it("should migrate GTON", async function () {

    let lockAmount = 1;

    await tokenContract.mint(ownerAddress, lockAmount);
    await tokenContract.approve(portGTONAddress, lockAmount);

    await portGTONContract.toggleLock();

    await balanceKeeperContract.toggleAdder(portGTONAddress)
    await portGTONContract.lockTokens(lockAmount);

    let destination = await accounts[0].getAddress();
    await portGTONContract.migrateGton(destination, 1)

    let balance = await tokenContract.balanceOf(destination)
    expect(balance).to.equal(1)
  });

});
