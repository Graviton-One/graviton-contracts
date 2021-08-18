import { ethers } from "hardhat"
import { BigNumber, Bytes } from "ethers"

export const EARLY_BIRDS_A = BigNumber.from("26499999999995")
export const EARLY_BIRDS_C = BigNumber.from("2100000")
export const STAKING_AMOUNT = BigNumber.from("1000")
export const STAKING_PERIOD = BigNumber.from("86400")
export const GTON_ADD_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000001"
export const GTON_SUB_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000002"
export const LP_ADD_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000003"
export const LP_SUB_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000004"
export const OTHER_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000005"
export const RELAY_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000006"
export const MOCK_UUID = "0x5ae47235f0844e55b26703b7cf385294"
export const EVM_CHAIN = "EVM"
export const BNB_CHAIN = "BNB"
export const FTM_CHAIN = "FTM"
export const PLG_CHAIN = "PLG"
export const ETH_CHAIN = "ETH"
export const SOL_CHAIN = "SOL"
export const MAX_UINT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
export const START_TIME = "1601906400"

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

export function makeValueImpact(
  token: string,
  depositer: string,
  amount: string,
  id: string,
  action: string
): Bytes {
  let lockTokenBytes = ethers.utils.arrayify(token)
  let depositerBytes = ethers.utils.arrayify(depositer)
  let amountBytes = ethers.utils.hexZeroPad(
    BigNumber.from(amount).toHexString(),
    32
  )
  let idBytes = ethers.utils.hexZeroPad(BigNumber.from(id).toHexString(), 32)
  let actionBytes = ethers.utils.hexZeroPad(
    BigNumber.from(action).toHexString(),
    32
  )

  return ethers.utils.concat([
    lockTokenBytes,
    depositerBytes,
    amountBytes,
    idBytes,
    actionBytes,
  ])
}

export function makeValueParser(
  uuid: string,
  chain: string,
  emiter: string,
  topics: string,
  topic0: string,
  token: string,
  sender: string,
  receiver: string,
  amount: string
): Bytes {
  let chainBytes = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(chain))
  let token32 = ethers.utils.hexZeroPad(token, 32)
  let sender32 = ethers.utils.hexZeroPad(sender, 32)
  let receiver32 = ethers.utils.hexZeroPad(receiver, 32)
  let amount32 = ethers.utils.hexZeroPad(
    BigNumber.from(amount).toHexString(),
    32
  )

  return ethers.utils.concat([
    ethers.utils.arrayify(uuid),
    ethers.utils.arrayify(chainBytes),
    ethers.utils.arrayify(emiter),
    ethers.utils.arrayify(topics),
    ethers.utils.arrayify(topic0),
    ethers.utils.arrayify(token32),
    ethers.utils.arrayify(sender32),
    ethers.utils.arrayify(receiver32),
    ethers.utils.arrayify(amount32),
  ])
}
