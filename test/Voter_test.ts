import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import * as chai from "chai";
chai.use(require("chai-as-promised")); // to check for failures
const expect = chai.expect;

describe("Voter", function () {
  let owner: Signer;
  let ownerAddress: string;
  let accounts: Signer[];

  let balanceKeeperContract: Contract;
  let balanceKeeperAddress: string;

  let voterContract: Contract;

  beforeEach(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();

    let balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeper");
    balanceKeeperContract = await balanceKeeperFactory.deploy(ownerAddress);
    balanceKeeperAddress = balanceKeeperContract.address;

    let voterFactory = await ethers.getContractFactory("Voter");
    voterContract = await voterFactory.deploy(ownerAddress, balanceKeeperAddress);

  });

  it("should start round", async function () {

    await voterContract.startRound("name", ["option1", "option2"])

    let roundName = await voterContract.roundName(0)
    let roundOption1 = await voterContract.roundOptions(0,0)
    let roundOption2 = await voterContract.roundOptions(0,1)
    let roundCount = await voterContract.roundCount()

    let name = expect(roundName).to.equal("name")
    let option1 = expect(roundOption1).to.equal("option1")
    let option2 = expect(roundOption2).to.equal("option2")
    let count = expect(roundCount).to.equal(1)


  });

  it("should cast votes", async function () {

    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 3);

    await voterContract.startRound("name", ["option1", "option2"])

    await voterContract.castVotes(0,[1,2])

    let option1 = await voterContract.votesForOptionByUser(0,ownerAddress,0)
    let option2 = await voterContract.votesForOptionByUser(0,ownerAddress,1)
    let options = await voterContract.votesInRoundByUser(0,ownerAddress)

    return expect(parseInt(option1.toString())).to.equal(1) &&
           expect(parseInt(option2.toString())).to.equal(2) &&
           expect(parseInt(options.toString())).to.equal(3)
  });

  it("should increment userCountInRound when first casting 1+ votes", async function () {

    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 3);

    await voterContract.startRound("name", ["option1", "option2"])

    await voterContract.castVotes(0,[1,2])

    let userCountInRound = await voterContract.userCountInRound(0)

    return expect(parseInt(userCountInRound.toString())).to.equal(1)
  });

  it("should not change userCountInRound when first casting 0 votes", async function () {

    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 3);

    await voterContract.startRound("name", ["option1", "option2"])

    await voterContract.castVotes(0,[0,0])

    let userCountInRound = await voterContract.userCountInRound(0)

    return expect(parseInt(userCountInRound.toString())).to.equal(0)
  });

  it("should decrement userCountInRound when overwriting with 0 votes", async function () {

    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 3);

    await voterContract.startRound("name", ["option1", "option2"])

    await voterContract.castVotes(0,[1,2])

    let userCountInRound_1 = await voterContract.userCountInRound(0)

    await voterContract.castVotes(0,[0,0])

    let userCountInRound_2 = await voterContract.userCountInRound(0)

    return expect(parseInt(userCountInRound_1.toString())).to.equal(1) &&
           expect(parseInt(userCountInRound_2.toString())).to.equal(0)
  });

  it("should increment userCountForOption when first casting 1+ votes", async function () {

    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 3);

    await voterContract.startRound("name", ["option1", "option2"])

    await voterContract.castVotes(0,[0,2])

    let userCountForOption1 = await voterContract.userCountForOption(0, 1)

    return expect(parseInt(userCountForOption1.toString())).to.equal(1)
  });

  it("should not change userCountForOption when first casting 0 votes", async function () {

    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 3);

    await voterContract.startRound("name", ["option1", "option2"])

    await voterContract.castVotes(0,[0,2])

    let userCountForOption0 = await voterContract.userCountForOption(0, 0)

    return expect(parseInt(userCountForOption0.toString())).to.equal(0)
  });

  it("should decrement userCountForOption when overwriting 0 votes", async function () {

    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 3);

    await voterContract.startRound("name", ["option1", "option2"])

    await voterContract.castVotes(0,[0,2])

    let userCountForOption1_1 = await voterContract.userCountForOption(0, 1)

    await voterContract.castVotes(0,[0,0])

    let userCountForOption1_2 = await voterContract.userCountForOption(0, 1)

    return expect(parseInt(userCountForOption1_1.toString())).to.equal(1) &&
           expect(parseInt(userCountForOption1_2.toString())).to.equal(0)
  });

  it("should check vote balances", async function () {

    await balanceKeeperContract.toggleAdder(ownerAddress);
    await balanceKeeperContract.addValue(ownerAddress, 8)

    await voterContract.startRound("name", ["option1", "option2"])

    await voterContract.castVotes(0,[2,4])

    await voterContract.toggleVoteBalanceChecker(ownerAddress);

    await voterContract.checkVoteBalances(ownerAddress, 4);

    let option1 = await voterContract.votesForOptionByUser(0,ownerAddress,0)
    let option2 = await voterContract.votesForOptionByUser(0,ownerAddress,1)
    let options = await voterContract.votesInRoundByUser(0,ownerAddress)

    return expect(parseInt(option1.toString())).to.equal(1) &&
           expect(parseInt(option2.toString())).to.equal(2) &&
           expect(parseInt(options.toString())).to.equal(3)
  });

  it("should forbid to vote after round has been finalized", async function () {

    await voterContract.startRound("name", ["option1", "option2"])
    await voterContract.finalizeRound(0)

    return expect(voterContract.castVotes(0,[2,4])).to.be.rejected;
  });

  it("should count finalized rounds", async function () {

    await voterContract.startRound("name", ["option1", "option2"])
    await voterContract.finalizeRound(0)

    await voterContract.startRound("name", ["option1", "option2"])
    await voterContract.finalizeRound(1)

    let pastRounds = await voterContract.pastRounds(1)

    return expect(pastRounds.toString()).to.equal("1")
  });
});
