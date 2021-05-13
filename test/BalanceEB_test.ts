import { ethers, network } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("BalanceEB", function () {
  let owner: Signer;
  let ownerAddress: string;
  let accounts: Signer[];

  let balanceKeeperContract: Contract;
  let balanceKeeperAddress: string;

  let farmEBContract: Contract;
  let farmEBAddress: string;

  let impactEBContract: Contract;
  let impactEBAddress: string;

  let balanceEBContract: Contract;
  let balanceEBAddress: string;

  let depositer: Signer;
  let depositerAddress: string;
  let lockTokenAddress: string;
  let amount: number = 100;

  beforeEach(async function () {
    [owner, depositer, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    depositerAddress = await depositer.getAddress();

    let balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeper");
    balanceKeeperContract = await balanceKeeperFactory.deploy(ownerAddress);
    balanceKeeperAddress = balanceKeeperContract.address;

    let farmEBFactory = await ethers.getContractFactory("Farm");
    let _a = 26499999999995;
    let _c = 2100000;
    farmEBContract = await farmEBFactory.deploy(ownerAddress, _a, _c);
    farmEBAddress = farmEBContract.address;

    await farmEBContract.startFarming();
    await network.provider.send("evm_increaseTime", [3600]);
    await farmEBContract.unlockAsset();

    let governanceTokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    let governanceTokenContract = await governanceTokenFactory.deploy("name", "symbol");
    let governanceTokenAddress = governanceTokenContract.address;

    let lockTokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    let lockTokenContract = await lockTokenFactory.deploy("name", "symbol");
    lockTokenAddress = lockTokenContract.address;

    let impactEBFactory = await ethers.getContractFactory("BirdsImpact");
    let _nebula: string = ownerAddress
    let _allowedTokens: string[] = [lockTokenAddress]
    let _governanceTokenAddr: string = governanceTokenAddress
    impactEBContract = await impactEBFactory.deploy(ownerAddress, _nebula, _allowedTokens, _governanceTokenAddr, farmEBAddress);
    impactEBAddress = impactEBContract.address;

    // attachValue to impact
    let lockTokenBytes = ethers.utils.arrayify(lockTokenAddress);
    let depositerBytes = ethers.utils.arrayify(depositerAddress);
    let amountBytes    = ethers.utils.hexZeroPad(ethers.BigNumber.from(amount.toString()).toHexString(),32);
    let idBytes        = ethers.utils.hexZeroPad(ethers.BigNumber.from("0").toHexString(),32);
    let actionBytes    = ethers.utils.hexZeroPad(ethers.BigNumber.from("0").toHexString(),32);

    let attachValue    = ethers.utils.concat([lockTokenBytes,depositerBytes,amountBytes,idBytes,actionBytes])

    await impactEBContract.attachValue(attachValue);

    let balanceEBFactory = await ethers.getContractFactory("BalanceEB");
    balanceEBContract = await balanceEBFactory.deploy(ownerAddress, farmEBAddress, impactEBAddress, balanceKeeperAddress);
    balanceEBAddress = balanceEBContract.address;
  });

  it("should processBalances", async function () {

    await balanceKeeperContract.toggleAdder(balanceEBAddress);

    await balanceEBContract.processBalances(1);

    let balance = await balanceKeeperContract.userBalance(depositerAddress);

    return expect(parseInt(balance.toString())).to.be.gt(0)

  });

});
