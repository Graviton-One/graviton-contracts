import { ethers } from 'hardhat'
import { BigNumber, Bytes } from 'ethers'

export const EARLY_BIRDS_A = BigNumber.from('26499999999995')
export const EARLY_BIRDS_C = BigNumber.from('2100000')
export const STAKING_AMOUNT = BigNumber.from('1000')
export const STAKING_PERIOD = BigNumber.from('86400')

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

export function makeValue(token: string, depositer: string, amount: string, id: string, action: string): Bytes {
    let lockTokenBytes = ethers.utils.arrayify(token)
    let depositerBytes = ethers.utils.arrayify(depositer)
    let amountBytes    = ethers.utils.hexZeroPad(BigNumber.from(amount).toHexString(), 32)
    let idBytes        = ethers.utils.hexZeroPad(BigNumber.from(id).toHexString(), 32)
    let actionBytes    = ethers.utils.hexZeroPad(BigNumber.from(action).toHexString(), 32)

    return ethers.utils.concat([lockTokenBytes,
                                depositerBytes,
                                amountBytes,
                                idBytes,
                                actionBytes])
  }
