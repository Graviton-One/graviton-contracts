import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("CrosschainLockGTON", function () {
  let owner: Signer;
  let ownerAddress: string;
  let bob: Signer;
  let bobAddress: string;
  let alice: Signer;
  let aliceAddress: string;
  let accounts: Signer[];

  let balanceKeeperContract: Contract;
  let balanceKeeperAddress: string;

  let tokenContract: Contract;
  let tokenAddress: string;

  let crosschainLockGTONContract: Contract;
  let crosschainLockGTONAddress: string;

  beforeEach(async function () {
    [owner, alice, bob, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    aliceAddress = await alice.getAddress();
    bobAddress = await bob.getAddress();

    let tokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    tokenContract = await tokenFactory.deploy("test", "test");
    tokenAddress = tokenContract.address;

    let crosschainLockGTONFactory = await ethers.getContractFactory("CrosschainLockGTON");
    crosschainLockGTONContract = await crosschainLockGTONFactory.deploy(ownerAddress, tokenAddress);
    crosschainLockGTONAddress = crosschainLockGTONContract.address;

  });

  it("should lock tokens", async function () {

    let lockAmount = 1;

    crosschainLockGTONContract = crosschainLockGTONContract.connect(owner);
    await crosschainLockGTONContract.toggleLock();

    tokenContract = tokenContract.connect(owner);
    await tokenContract.mint(aliceAddress, lockAmount);

    tokenContract = tokenContract.connect(alice);
    await tokenContract.approve(crosschainLockGTONAddress, lockAmount);

    crosschainLockGTONContract = crosschainLockGTONContract.connect(alice);
    await expect(crosschainLockGTONContract.lockTokens(bobAddress, lockAmount))
      .to.emit(crosschainLockGTONContract, 'LockGTONEvent')
      .withArgs(tokenAddress, aliceAddress, bobAddress, 1);
  });


  it("should migrate GTON", async function () {

    let lockAmount = 1;

    await tokenContract.mint(ownerAddress, lockAmount);
    await tokenContract.approve(crosschainLockGTONAddress, lockAmount);

    await crosschainLockGTONContract.toggleLock();

    await crosschainLockGTONContract.lockTokens(bobAddress, lockAmount);

    let destination = await accounts[0].getAddress();
    await crosschainLockGTONContract.migrateGton(destination, 1)

    let balance = await tokenContract.balanceOf(destination)
    expect(balance).to.equal(1)
  });

});
