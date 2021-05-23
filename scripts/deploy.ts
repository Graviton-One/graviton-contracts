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


  // deploy balanceKeeper
  let balanceKeeperFactory = await ethers.getContractFactory("BalanceKeeper");
  let balanceKeeperContract = await balanceKeeperFactory.deploy(ownerAddress);
  let balanceKeeperAddress = balanceKeeperContract.address;
  console.log("BalanceKeeper:  ", balanceKeeperAddress)

  // deploy balanceEB
  let farmEBAddress: string
  let impactEBAddress: string
  if (network.name == "hardhat") {
    let farmEBFactory = await ethers.getContractFactory("Farm");
    let _a = 26499999999995;
    let _c = 2100000;
    let farmEBContract = await farmEBFactory.deploy(ownerAddress, _a, _c);
    farmEBAddress = farmEBContract.address;

    await farmEBContract.startFarming();
    await network.provider.send("evm_increaseTime", [3600]);
    await farmEBContract.unlockAsset();

    let governanceTokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    let governanceTokenContract = await governanceTokenFactory.deploy("name", "symbol");
    let governanceTokenAddress = governanceTokenContract.address;

    let lockTokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    let lockTokenContract = await lockTokenFactory.deploy("name", "symbol");
    let lockTokenAddress = lockTokenContract.address;

    let impactEBFactory = await ethers.getContractFactory("BirdsImpact");
    let _nebula: string = ownerAddress
    let _allowedTokens: string[] = [lockTokenAddress]
    let _governanceTokenAddr: string = governanceTokenAddress
    let impactEBContract = await impactEBFactory.deploy(ownerAddress, _nebula, _allowedTokens, _governanceTokenAddr, farmEBAddress);
    impactEBAddress = impactEBContract.address;
  }
  if (network.name == "fantom") {
      farmEBAddress = "0xa4e8C675f0E1DDbD2361324e909361ff9455222c"
      impactEBAddress = "0x89bE71535fFC044CC829EE8B919Cd145d71154E4"
  }
  let balanceEBFactory = await ethers.getContractFactory("BalanceEB");
  let balanceEBContract = await balanceEBFactory.deploy(ownerAddress, farmEBAddress, impactEBAddress, balanceKeeperAddress);
  let balanceEBAddress = balanceEBContract.address;
  console.log("BalanceEB:      ", balanceEBAddress)

  // deploy balanceStaking
  let farmStakingAddress: string
  if (network.name == "hardhat") {
    let farmStakingFactory = await ethers.getContractFactory("Farm");
    let _a = 26499999999995;
    let _c = 2100000;
    let farmStakingContract = await farmStakingFactory.deploy(ownerAddress, _a, _c);
    farmStakingAddress = farmStakingContract.address;

    await farmStakingContract.startFarming();
    await network.provider.send("evm_increaseTime", [3600]);
    await farmStakingContract.unlockAsset();
  }
  if (network.name == "fantom") {
     farmStakingAddress = "0xF1b64cB91FFE82F8eFF2575669856a28B30A0450"
  }
  let balanceStakingFactory = await ethers.getContractFactory("BalanceStaking");
  let balanceStakingContract = await balanceStakingFactory.deploy(ownerAddress, farmStakingAddress, balanceKeeperAddress);
  let balanceStakingAddress = balanceStakingContract.address;
  console.log("BalanceStaking: ", balanceStakingAddress)

  // deploy voter
  let voterFactory = await ethers.getContractFactory("Voter");
  let voterContract = await voterFactory.deploy(ownerAddress, balanceKeeperAddress);
  let voterAddress = voterContract.address;
  console.log("Voter:          ", voterAddress)

  // deploy portGTON
  let gtonAddress: string
  if (network.name == "hardhat") {
    let gtonFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    let gtonContract = await gtonFactory.deploy("test", "test");
    gtonAddress = gtonContract.address;
  }
  if (network.name == "fantom") {
      gtonAddress = "0x44ec6bcc2B3dC8b1bBB78c8dfb5C0d72Acd41D87"
  }
  let portGTONFactory = await ethers.getContractFactory("PortGTON");
  let portGTONContract = await portGTONFactory.deploy(ownerAddress, gtonAddress, balanceKeeperAddress, [voterAddress]);
  let portGTONAddress = portGTONContract.address;
  console.log("PortGTON:       ", portGTONAddress)

  // deploy portLP
  let lpTokenAddress: string
  if (network.name == "hardhat") {
    let lpTokenFactory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    let lpTokenContract = await lpTokenFactory.deploy("test", "test");
    lpTokenAddress = lpTokenContract.address;
  }
  if (network.name == "fantom") {
      lpTokenAddress = "0xFa40186cd2c0cb7B451E58a42f0b51a4F3c6C1E9"
  }
  let portLPFactory = await ethers.getContractFactory("PortLP");
  let portLPContract = await portLPFactory.deploy(ownerAddress, farmEBAddress, balanceKeeperAddress, lpTokenAddress);
  let portLPAddress = portLPContract.address;
  console.log("PortLP:         ", portLPAddress)

  await balanceKeeperContract.toggleAdder(balanceEBAddress)
  await balanceKeeperContract.toggleAdder(balanceStakingAddress)
  await balanceKeeperContract.toggleAdder(portGTONAddress)
  await balanceKeeperContract.toggleAdder(portLPAddress)
  await balanceKeeperContract.toggleSubtractor(portLPAddress)
  await voterContract.toggleVoteBalanceChecker(portGTONAddress)

  try {
    await run("verify:verify", {
    address: balanceKeeperAddress,
    constructorArguments: [
      ownerAddress
    ],
    })
  } catch (err) {
    console.log("Verification failed: BalanceKeeper")
  }
  try {
  await run("verify:verify", {
  address: balanceEBAddress,
  constructorArguments: [
    ownerAddress,
    farmEBAddress,
    impactEBAddress,
    balanceKeeperAddress
  ],
  })
  } catch (err) {
    console.log("Verification failed: BalanceEB")
  }
  try {
  await sleep(3600);
  await run("verify:verify", {
  address: balanceStakingAddress,
  constructorArguments: [
    ownerAddress,
    farmStakingAddress,
    balanceKeeperAddress
  ],
  })
  } catch (err) {
    console.log("Verification failed: BalanceStaking")
  }
  try {
  await sleep(3600);
  await run("verify:verify", {
  address: voterAddress,
  constructorArguments: [
    ownerAddress,
    balanceKeeperAddress
  ],
  })
  } catch (err) {
    console.log("Verification failed: Voter")
  }
  try {
  await run("verify:verify", {
  address: portGTONAddress,
  constructorArguments: [
    ownerAddress,
    gtonAddress,
    balanceKeeperAddress,
    [voterAddress]
  ],
  })
  } catch (err) {
    console.log("Verification failed: PortGTON")
  }
  try {
  await run("verify:verify", {
  address: portLPAddress,
  constructorArguments: [
    ownerAddress,
    farmEBAddress,
    balanceKeeperAddress,
    lpTokenAddress
  ],
  })
  } catch (err) {
    console.log("Verification failed: PortLP")
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
