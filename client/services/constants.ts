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
    lockLP: string,
    relayLock: string,
    team: string,
    bot: string,
    consul1: string,
    consul2: string,
    consul3: string,
    otc: string,
    usdc: string,
    busd: string
}
export interface Chain {
    provider: ethers.providers.JsonRpcProvider
    gton: string,
    lockGTON: string,
    lp: string,
    faucet: string,
    lockLP: string,
    relayLock: string,
    otc: string,
    usdc: string,
    busd: string
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
    claim: '0x26F79c88073Dfc9a1E4D3d6c53C087516dc6Bb7b',
    claimWallet: '0xf0cAfC0dfBd5a82E45d0E94f9da7D97DACfc79Ca',
    lp: '0x070AB37714b96f1A938e75CAbbb64ED5F5748170',
    lockGTON: '0x5B1C102A6d849F9cfe2B1369AffDd57f5678B91d',
    lockLP: '0xF488b8D9a391F27d5e83fa421Bda986B7d4Da41A',
    farmLP: '',
    sharesLP: '',
    relayLock: '0x48EDeD8EC5C52308011F191600c0e1ae60F49be6',
    team: '0xCed486E3905F8FE1E8aF5d1791F5E7Ad7915f01a',
    bot: '0x5685A7350cAE5Fa7ffc16eC3d723c6D5A250c27b',
    consul1: '0x6ac9bd01C19aBfF57119e859652D4A2a5e4f9217',
    consul2: '0xD13a6Cd149336A323f925Fd5B660e322E048558e',
    consul3: '0x977fa57A02cc421E26099a4F499605cb7Dd853d2',
    otc: '0x60E54bdb32785502326452366Fd4E063c7854A93',
    usdc: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    busd: ''
}

export const ETH: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/77f1c5201f43496fb13f1855b97da1dc"),
    gton: '0x01e0E2e61f554eCAaeC0cC933E739Ad90f24a86d',
    lockGTON: '0xa931D5543c8347b30e09c5842E337883782e95BC',
    lp: '0x0b3ecea6bc79be3ecc805528655c4fc173cac2dd',
    lockLP: '0xA69e5e2094e55B80B71C39849DE8186ed9B88b38',
    faucet: '',
    relayLock: '0x53dd6d712ad1b7613bca7cf7f34e436f75729dd9',
    otc: '',
    usdc: '',
    busd: ''
}

export const PLG: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com"),
    gton: '0xf480f38c366daac4305dc484b2ad7a496ff00cea',
    lockGTON: '0x006f0F09D3Cc95E8f8Ff3Ce6a561053D08AE0Cca',
    lp: '0xf01a0a0424bda0acdd044a61af88a34636e0001c',
    lockLP: '0xbba98EA00ab995a467e9aFabBb15dBDDD29E1f44',
    faucet: '',
    relayLock: '0x308dC032417Bb4b9A79606A6c61Fce3c375cF6D5',
    otc: '0xC721B4B560471bFD39bEa41BC7549559B076b680',
    usdc: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    busd: ''
}

export const BSC: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org"),
    gton: '0x64D5BaF5ac030e2b7c435aDD967f787ae94D0205',
    lockGTON: '0x697D6e1F1C97b2Ee0B56C42f6BD25FD0bd7355c1',
    lp: '0xbe2c760aE00CbE6A5857cda719E74715edC22279',
    lockLP: '0xF8405Aebd87E37E60549D4f28a5A88Deb38bEA7B',
    faucet: '0x49b6431BDcd6CFaf79a3a5309261cB268642d8C0',
    relayLock: '0xDe87ca6b2e0ff2913F2Bc14232AAF400FC3826D3',
    otc: '0x5aC59d3DE6D16AEB38f872298D9e176817c656F4',
    usdc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    busd: '0xe9e7cea3dedca5984780bafc599bd69add087d56'
}

export const HEC: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://http-mainnet.hecochain.com"),
    gton: '0x922d641a426dcffaef11680e5358f34d97d112e1',
    lockGTON: '',
    lp: '',
    lockLP: '',
    faucet: '',
    relayLock: '0xf9cdaBB96Cffdd53817aEA813273cBe8c39B328e',
    otc: '',
    usdc: '',
    busd: ''
}

export const AVA: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc"),
    gton: '0x4E720DD3Ac5CFe1e1fbDE4935f386Bb1C66F4642',
    lockGTON: '',
    lp: '',
    lockLP: '',
    faucet: '',
    relayLock: '0x9366EA2931F069C115Dd7ea041d8eAFd1C76f444',
    otc: '',
    usdc: '',
    busd: ''

}

export const DAI: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://rpc.xdaichain.com"),
    gton: '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
    lockGTON: '',
    lp: '',
    lockLP: '',
    faucet: '',
    relayLock: '0xbba98EA00ab995a467e9aFabBb15dBDDD29E1f44',
    otc: '',
    usdc: '',
    busd: ''

}
