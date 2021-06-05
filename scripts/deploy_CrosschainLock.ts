import { run, ethers, network } from "hardhat";

function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

async function main() {
  await run("compile");

  console.log("Network:        ", network.name)

  let [owner, ...accounts] = await ethers.getSigners();
  let ownerAddress = await owner.getAddress();

  console.log("Owner:          ", ownerAddress)

  let testGTONAddress: string
  if (network.name == "hardhat") {
    let testGTONFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    let testGTONContract = await testGTONFactory.deploy("test", "test");
    testGTONAddress = testGTONContract.address;
  }
  if (network.name == "fantom") {
      testGTONAddress = ""
  }
  if (network.name == "bsc") {
      testGTONAddress = ""
  }
  if (network.name == "polygon") {
      testGTONAddress = ""
  }
  // deploy crosschainLockGTON
  let crosschainLockGTONFactory = await ethers.getContractFactory("CrosschainLockGTON");
  let crosschainLockGTONContract = await crosschainLockGTONFactory.deploy(ownerAddress, testGTONAddress);
  let crosschainLockGTONAddress = crosschainLockGTONContract.address;
  console.log("CLockGTON:      ", crosschainLockGTONAddress)

  let testLPAddress: string
  if (network.name == "hardhat") {
    let testLPFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    let testLPContract = await testLPFactory.deploy("test", "test");
    testLPAddress = testLPContract.address;
  }
  if (network.name == "fantom") {
      testLPAddress = ""
  }
  if (network.name == "bsc") {
      testLPAddress = ""
  }
  if (network.name == "polygon") {
      testLPAddress = ""
  }
  let crosschainLockLPFactory = await ethers.getContractFactory("CrosschainLockLP");
  let crosschainLockLPContract = await crosschainLockLPFactory.deploy(ownerAddress, [testLPAddress]);
  let crosschainLockLPAddress = crosschainLockLPContract.address;
  console.log("CLockLP:        ", crosschainLockLPAddress)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
