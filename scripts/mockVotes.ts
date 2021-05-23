
import { run, ethers, network } from "hardhat";

function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

async function main() {
  await run("compile");

  console.log("Network:        ", network.name);

  let [owner, ...accounts] = await ethers.getSigners();
  let ownerAddress = await owner.getAddress();

  console.log("Owner:          ", ownerAddress);

  // deploy voter
  let voterAddress = "0xD08168F85FA042B58e1c8eBEA03C2f0E4909A20d";
  let voterFactory = await ethers.getContractFactory("Voter");
  let voterContract = await voterFactory.attach(voterAddress);

  let roundCountOld = await voterContract.roundCount();
  console.log("Old round count:", roundCountOld.toString());

  await voterContract.startRound("Round1", ["R1 Option1", "R1 Option2", "R1 Option3", "R1 Option4"]);
  await voterContract.startRound("Round2", ["R2 Option1", "R2 Option2", "R2 Option3"]);
  await voterContract.startRound("Round3", ["R3 Option1", "R3 Option2", "R3 Option3", "R3 Option4", "R3 Option5", "R3 Option6", "R3 Option7", "R3 Option8", "R3 Option9", "R3 Option10"]);

  await sleep(3600);

  let roundCountNew = await voterContract.roundCount();
  console.log("New round count:", roundCountNew.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
