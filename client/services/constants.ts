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
    testLP: string
}
export interface Chain {
    provider: ethers.providers.JsonRpcProvider
    gton: string,
    lockGTON: string,
    lp: string,
    testLP: string,
    faucet: string,
    lockLP: string,
}

export const FTM: Fantom = {
    provider: new ethers.providers.JsonRpcProvider("https://rpcapi.fantom.network"),
    gton: '0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4',
    nebula: '0x092010568ea4a34a3fe08a163a84d91b08802875',
    balanceKeeper: '0x08D751281654cF6E6951E303eC3c55f92a4B22bd',
    voter: '0x238b80A701876b3421599650E9A85A10354363DD',
    lpKeeper: '0xd11577b6994444D3dEf01f145EFAad6393CE224B',
    router: '0x0e760eC6EEC7e6Bf0374CDb8c81a1Dedc75C821d',
    parser: '0x971c07e113b84D8B707a5E40f1BC8419DA76bc1C',
    balanceAdder: '0xa93f9cdC1d2f976EB307eeC941024B305AB1E176',
    farmEB: '0x4Cb8824d45312D5dC9d9B5260fb2B1dEC297015b',
    sharesEB: '0x5766AA0199C8d66b662d036ac31864dfa01852Ab',
    farmStaking: '0x99587ecA8b1A371e673601E2a4a1be7a65F74867',
    claim: '0x38F10fdd3B825a51578A5DFA7f21d261e0B8733C',
    claimWallet: '0xF87A9819ce260FB710C00Bb841bF4b8b311Ec741',
    testLP: '0x070AB37714b96f1A938e75CAbbb64ED5F5748170',
    farmLP: '',
    sharesLP: '',
}

export const ETH: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/77f1c5201f43496fb13f1855b97da1dc"),
    gton: '0x01e0E2e61f554eCAaeC0cC933E739Ad90f24a86d',
    lockGTON: '0x98E81943Aba1aC87EF4c28eE08afAd1FDc5E7D9f',
    lp: '0x0b3ecea6bc79be3ecc805528655c4fc173cac2dd',
    testLP: '0x26c4D31A97F48e2229193984604819BC585093C6',
    lockLP: '0xF9409cE8187EF3Fa04b02fE2109C3e4E9e03FF3B',
    faucet: ''
}

export const PLG: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com"),
    gton: '0xf480f38c366daac4305dc484b2ad7a496ff00cea',
    lockGTON: '0x0Ab3043417D6A2C8510ce3AbDB88BB534937cd45',
    lp: '0xf01a0a0424bda0acdd044a61af88a34636e0001c',
    testLP: '0xFBe64d17911DC0a2AC5977C9a8Bc0183104922Df',
    lockLP: '0x7976c5b73F1a0E9813dD6ace146F89120F003C53',
    faucet: ''
}

export const BSC: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org"),
    gton: '0x64D5BaF5ac030e2b7c435aDD967f787ae94D0205',
    lockGTON: '0x08D751281654cF6E6951E303eC3c55f92a4B22bd',
    lp: '0xbe2c760aE00CbE6A5857cda719E74715edC22279',
    testLP: '0x0e760eC6EEC7e6Bf0374CDb8c81a1Dedc75C821d',
    lockLP: '0x238b80A701876b3421599650E9A85A10354363DD',
    faucet: '0x49b6431BDcd6CFaf79a3a5309261cB268642d8C0'
}
