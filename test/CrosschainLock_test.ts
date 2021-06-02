import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("CrosschainLock", function () {
  let owner: Signer;
  let ownerAddress: string;
  let receiver: Signer;
  let receiverAddress: string;
  let accounts: Signer[];

  let balanceKeeperContract: Contract;
  let balanceKeeperAddress: string;

  let tokenContract: Contract;
  let tokenAddress: string;

  let voterContract: Contract;
  let voterAddress: string;

  let crosschainLockContract: Contract;
  let CrosschainLockAddress: string;

  beforeEach(async function () {
    [owner, receiver, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    receiverAddress = await receiver.getAddress();

    let tokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    tokenContract = await tokenFactory.deploy("test", "test");
    tokenAddress = tokenContract.address;

    let CrosschainLockFactory = await ethers.getContractFactory("CrosschainLock");
    crosschainLockContract = await CrosschainLockFactory.deploy(ownerAddress, tokenAddress);
    CrosschainLockAddress = crosschainLockContract.address;

  });

  it("should lock tokens", async function () {

    let lockAmount = 1;

    await tokenContract.mint(ownerAddress, lockAmount);
    await tokenContract.approve(CrosschainLockAddress, lockAmount);

    await crosschainLockContract.toggleLock();

    await expect(crosschainLockContract.lockTokens(receiverAddress, lockAmount))
      .to.emit(crosschainLockContract, 'LockTokensEvent')
      .withArgs(ownerAddress, receiverAddress, 1);
  });


  it("should migrate GTON", async function () {

    let lockAmount = 1;

    await tokenContract.mint(ownerAddress, lockAmount);
    await tokenContract.approve(CrosschainLockAddress, lockAmount);

    await crosschainLockContract.toggleLock();

    await crosschainLockContract.lockTokens(receiverAddress, lockAmount);

    let destination = await accounts[0].getAddress();
    await crosschainLockContract.migrateGton(destination, 1)

    let balance = await tokenContract.balanceOf(destination)
    expect(balance).to.equal(1)
  });

});
