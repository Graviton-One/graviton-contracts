import { ethers, network } from "hardhat";
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

  let lpTokenContract: Contract;
  let lpTokenAddress: string;

  let farmEmissionContract: Contract;
  let farmEmissionAddress: string;

  let portLPContract: Contract;
  let portLPAddress: string;

  beforeEach(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();

    let balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeper");
    balanceKeeperContract = await balanceKeeperFactory.deploy(ownerAddress);
    balanceKeeperAddress = balanceKeeperContract.address;

    let lpTokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    lpTokenContract = await lpTokenFactory.deploy("name", "symbol");
    lpTokenAddress = lpTokenContract.address;

    let farmEmissionFactory = await ethers.getContractFactory("Farm");
    let _a = 26499999999995;
    let _c = 2100000;
    farmEmissionContract = await farmEmissionFactory.deploy(ownerAddress, _a, _c);
    farmEmissionAddress = farmEmissionContract.address;

    let portLPFactory = await ethers.getContractFactory("PortLP");
    portLPContract = await portLPFactory.deploy(ownerAddress, farmEmissionAddress, balanceKeeperAddress, lpTokenAddress);
    portLPAddress = portLPContract.address;

  });

  it("should lock lp", async function () {

    let lockAmount = 1;

    await lpTokenContract.mint(ownerAddress, lockAmount);
    await lpTokenContract.approve(portLPAddress, lockAmount)

    await portLPContract.lockLP(lockAmount)

    let impactBN = await portLPContract.impact(ownerAddress)
    let impactInt = parseInt(impactBN.toString())
    expect(impactInt).to.equal(lockAmount)
  });

  it("should unlock lp", async function () {

    let lockAmount = 2;
    let unlockAmount = 1;
    let resultAmount = 1;

    await lpTokenContract.mint(ownerAddress, lockAmount);
    await lpTokenContract.approve(portLPAddress, lockAmount)

    await portLPContract.lockLP(lockAmount)

    await portLPContract.unlockLP(unlockAmount, ownerAddress)
    let impactBN = await portLPContract.impact(ownerAddress)
    let impactInt = parseInt(impactBN.toString())
    expect(impactInt).to.equal(resultAmount)
  });

  it("should processImpacts", async function () {

    await farmEmissionContract.startFarming();

    await farmEmissionContract.unlockAsset();

    let lockAmount = 10;

    await lpTokenContract.mint(ownerAddress, lockAmount);
    await lpTokenContract.approve(portLPAddress, lockAmount);

    await portLPContract.lockLP(lockAmount);

    await balanceKeeperContract.toggleAdder(portLPAddress);

    await portLPContract.processImpacts(1);

    let balanceBN = await balanceKeeperContract.userBalance(ownerAddress);
    let balanceInt = parseInt(balanceBN.toString())
    expect(balanceInt).to.be.gt(0)

  });
});
