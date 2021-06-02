import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("OracleAdder", function () {
  let owner: Signer;
  let ownerAddress: string;
  let receiver: Signer;
  let receiverAddress: string;
  let nebula: Signer;
  let nebulaAddress: string;
  let accounts: Signer[];

  let balanceKeeperContract: Contract;
  let balanceKeeperAddress: string;

  let oracleAdderContract: Contract;
  let oracleAdderAddress: string;

  beforeEach(async function () {
    [owner, receiver, nebula, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    receiverAddress = await receiver.getAddress();
    nebulaAddress = await nebula.getAddress();

    let balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeper");
    balanceKeeperContract = await balanceKeeperFactory.deploy(ownerAddress);
    balanceKeeperAddress = balanceKeeperContract.address;

    let oracleAdderFactory = await ethers.getContractFactory("OracleAdder");
    oracleAdderContract = await oracleAdderFactory.deploy(ownerAddress, balanceKeeperAddress, nebulaAddress);
    oracleAdderAddress = oracleAdderContract.address;

  });

  it("should addValue on attachValue", async function () {

    let amount: number = 1;

    await balanceKeeperContract.toggleAdder(oracleAdderAddress);

    let senderAddress = ownerAddress;
    let senderBytes = ethers.utils.arrayify(senderAddress);
    let receiverBytes = ethers.utils.arrayify(receiverAddress);
    let amountBytes = ethers.utils.hexZeroPad(ethers.BigNumber.from(amount.toString()).toHexString(), 32);

    let attachValue = ethers.utils.concat([senderBytes,receiverBytes,amountBytes])

    oracleAdderContract = oracleAdderContract.connect(nebula);
    await oracleAdderContract.attachValue(attachValue);

    let balanceBN = await balanceKeeperContract.userBalance(receiverAddress);
    let balanceInt = parseInt(balanceBN.toString());

    expect(balanceInt).to.equal(amount)
  });

  it("should fail addValue when not nebula", async function () {

    let amount = 1;

    await balanceKeeperContract.toggleAdder(oracleAdderAddress);

    let senderAddress = ownerAddress;
    let senderBytes = ethers.utils.arrayify(senderAddress);
    let receiverBytes = ethers.utils.arrayify(receiverAddress);
    let amountBytes = ethers.utils.hexZeroPad(ethers.BigNumber.from(amount.toString()).toHexString(), 32);

    let attachValue = ethers.utils.concat([senderBytes,receiverBytes,amountBytes])

    return expect(oracleAdderContract.attachValue(attachValue)).to.be.rejected;
  });

});
