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

  let ERC20Factory = await ethers.getContractFactory("ERC20PresetMinterPauser");
  let ERC20Contract = await ERC20Factory.deploy("test", "test");
  let ERC20Address = ERC20Contract.address;
  console.log("ERC20:      ", ERC20Address)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
