import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("CrosschainLockLP", function () {
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

  let voterContract: Contract;
  let voterAddress: string;

  let crosschainLockLPContract: Contract;
  let crosschainLockLPAddress: string;

  beforeEach(async function () {
    [owner, alice, bob, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    aliceAddress = await alice.getAddress();
    bobAddress = await bob.getAddress();

    let tokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    tokenContract = await tokenFactory.deploy("test", "test");
    tokenAddress = tokenContract.address;

    let crosschainLockLPFactory = await ethers.getContractFactory("CrosschainLockLP");
    crosschainLockLPContract = await crosschainLockLPFactory.deploy(ownerAddress, [tokenAddress]);
    crosschainLockLPAddress = crosschainLockLPContract.address;

  });

  it("should lock tokens", async function () {

    let lockAmount = 1;

    tokenContract = tokenContract.connect(owner);
    await tokenContract.mint(aliceAddress, lockAmount);

    tokenContract = tokenContract.connect(alice);
    await tokenContract.approve(crosschainLockLPAddress, lockAmount);

    crosschainLockLPContract = crosschainLockLPContract.connect(alice);
    await expect(crosschainLockLPContract.lockTokens(tokenAddress, bobAddress, lockAmount))
      .to.emit(crosschainLockLPContract, 'LockTokensEvent')
      .withArgs(tokenAddress, aliceAddress, bobAddress, lockAmount);
  });

  it("should unlock tokens", async function () {

    let lockAmount = 1;
    let unlockAmount = 1;

    tokenContract = tokenContract.connect(owner);
    await tokenContract.mint(aliceAddress, lockAmount);

    tokenContract = tokenContract.connect(alice);
    await tokenContract.approve(crosschainLockLPAddress, lockAmount);

    crosschainLockLPContract = crosschainLockLPContract.connect(alice);
    crosschainLockLPContract.lockTokens(tokenAddress, bobAddress, lockAmount);

    crosschainLockLPContract = crosschainLockLPContract.connect(bob);
    await expect(crosschainLockLPContract.unlockTokens(tokenAddress, aliceAddress, unlockAmount))
      .to.emit(crosschainLockLPContract, 'UnlockTokensEvent')
      .withArgs(tokenAddress, bobAddress, aliceAddress, unlockAmount);
  });

});
