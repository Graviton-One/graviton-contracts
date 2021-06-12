import { BigNumber } from 'ethers'

export const EARLY_BIRDS_A = BigNumber.from('26499999999995')
export const EARLY_BIRDS_C = BigNumber.from('2100000')
export const STAKING_AMOUNT = BigNumber.from('1000')
export const STAKING_PERIOD = BigNumber.from('86400')

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}
