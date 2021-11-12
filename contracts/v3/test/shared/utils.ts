import { ethers } from "hardhat"
import { BytesLike, ContractFactory } from "ethers"

export async function getFactory({
  abi,
  bytecode,
}: {
  abi: any[]
  bytecode: BytesLike
}): Promise<ContractFactory> {
  return await ethers.getContractFactory(abi, bytecode)
}
