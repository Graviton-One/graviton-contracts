import { ethers } from 'ethers'

export interface Fantom {
    provider: ethers.providers.JsonRpcProvider
    gton: string,
    nebula: string,
    router: string,
    parser: string,
    balanceKeeper: string,
    lpKeeper: string,
    balanceAdder: string,
    farmEB: string,
    sharesEB: string,
    farmStaking: string,
    farmLP: string,
    sharesLP: string,
    claim: string,
    claimWallet: string,
    voter: string,
    lp: string,
    lockGTON: string,
    lockLP: string
}
export interface Chain {
    provider: ethers.providers.JsonRpcProvider
    gton: string,
    lockGTON: string,
    lp: string,
    faucet: string,
    lockLP: string,
}

export const FTM: Fantom = {
    provider: new ethers.providers.JsonRpcProvider("https://rpcapi.fantom.network"),
    gton: '0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4',
    nebula: '0x2FAC2013Fc3a9ca6e0a9FD84037b3DD0d3ceD57A',
    balanceKeeper: '0x4AB096F49F2Af3cfcf2D851094FA5936f18aed90',
    voter: '0x23836bcd86D6349FB5f353d80336FaCd74c19a66',
    lpKeeper: '0xA0447eE66E44BF567FF9287107B0c3D2F88efD93',
    router: '0x1b3223c54f04543Bc656a2C2C127576F314b5449',
    parser: '0x7fCCE1303F7e1fc14780C87F6D67346EC44a4027',
    balanceAdder: '0x8d712f350A55D65427EfcE56Ec6a36fef28e8Ac9',
    farmEB: '0x4Cb8824d45312D5dC9d9B5260fb2B1dEC297015b',
    sharesEB: '0x521C9352E2782c947F4354179D144f09D8c0b0c3',
    farmStaking: '0x99587ecA8b1A371e673601E2a4a1be7a65F74867',
    claim: '0x9d2f7Dc325898E50D32783a95654eb377c994253',
    claimWallet: '0xCed486E3905F8FE1E8aF5d1791F5E7Ad7915f01a',
    lp: '0x070AB37714b96f1A938e75CAbbb64ED5F5748170',
    lockGTON: '0x5B1C102A6d849F9cfe2B1369AffDd57f5678B91d',
    lockLP: '0xF488b8D9a391F27d5e83fa421Bda986B7d4Da41A',
    farmLP: '',
    sharesLP: '',
}

export const ETH: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/77f1c5201f43496fb13f1855b97da1dc"),
    gton: '0x01e0E2e61f554eCAaeC0cC933E739Ad90f24a86d',
    lockGTON: '0xa931D5543c8347b30e09c5842E337883782e95BC',
    lp: '0x0b3ecea6bc79be3ecc805528655c4fc173cac2dd',
    lockLP: '0xA69e5e2094e55B80B71C39849DE8186ed9B88b38',
    faucet: ''
}

export const PLG: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com"),
    gton: '0xf480f38c366daac4305dc484b2ad7a496ff00cea',
    lockGTON: '0x006f0F09D3Cc95E8f8Ff3Ce6a561053D08AE0Cca',
    lp: '0xf01a0a0424bda0acdd044a61af88a34636e0001c',
    lockLP: '0xbba98EA00ab995a467e9aFabBb15dBDDD29E1f44',
    faucet: ''
}

export const BSC: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org"),
    gton: '0x64D5BaF5ac030e2b7c435aDD967f787ae94D0205',
    lockGTON: '0x697D6e1F1C97b2Ee0B56C42f6BD25FD0bd7355c1',
    lp: '0xbe2c760aE00CbE6A5857cda719E74715edC22279',
    lockLP: '0xF8405Aebd87E37E60549D4f28a5A88Deb38bEA7B',
    faucet: '0x49b6431BDcd6CFaf79a3a5309261cB268642d8C0'
}
