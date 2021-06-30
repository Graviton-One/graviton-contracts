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
    voter: string
}
export interface Chain {
    provider: ethers.providers.JsonRpcProvider
    gton: string,
    lockGTON: string,
    testLP: string,
    faucet: string,
    lockLP: string,
}

export const FTM: Fantom = {
    provider: new ethers.providers.JsonRpcProvider("https://rpcapi.fantom.network"),
    gton: '0x3e72051618f3E16F86a63A371cC59206675C3624',
    nebula: '0xB896F06b6FC783AD25d6551058f630244761CBc9',
    balanceKeeper: '0xa7732A26786A8F8bB3899225759F141c5057C516',
    lpKeeper: '0x0eFe7394f1cfe828302415F6547268e59B117f34',
    router: '0x5dE8d57aF435eccf7345636C6D6774bf185448a1',
    parser: '0xE0c9fb1C0FFba375F5CecD48AcD545D32E678601',
    balanceAdder: '0x8a734821bc968cC076b3E0dB4F49c1242f02e564',
    farmEB: '0x4Cb8824d45312D5dC9d9B5260fb2B1dEC297015b',
    sharesEB: '0xC5C59494EB8244550c008bf691219F6430872949',
    farmStaking: '0x99587ecA8b1A371e673601E2a4a1be7a65F74867',
    claim: '0x3E0d4077119b6109c80774f1F80Bc949f0fA7853',
    claimWallet: '0x8924F7f9eE7571F6F7B49E8a8F46cA2BAd65EddE',
    farmLP: '',
    sharesLP: '',
    voter: '0xBdB72D66326b5edA391938903Dca79aE50BD5Ec7'
}

export const ETH: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/77f1c5201f43496fb13f1855b97da1dc"),
    gton: '0x01e0E2e61f554eCAaeC0cC933E739Ad90f24a86d',
    lockGTON: '0x98E81943Aba1aC87EF4c28eE08afAd1FDc5E7D9f',
    testLP: '0x26c4D31A97F48e2229193984604819BC585093C6',
    lockLP: '0xF9409cE8187EF3Fa04b02fE2109C3e4E9e03FF3B',
    faucet: ''
}

export const PLG: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com"),
    gton: '0xf480f38c366daac4305dc484b2ad7a496ff00cea',
    lockGTON: '0x0Ab3043417D6A2C8510ce3AbDB88BB534937cd45',
    testLP: '0xFBe64d17911DC0a2AC5977C9a8Bc0183104922Df',
    lockLP: '0x7976c5b73F1a0E9813dD6ace146F89120F003C53',
    faucet: ''
}

export const BSC: Chain = {
    provider: new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org"),
    gton: '0x64D5BaF5ac030e2b7c435aDD967f787ae94D0205',
    lockGTON: '0x08D751281654cF6E6951E303eC3c55f92a4B22bd',
    testLP: '0x0e760eC6EEC7e6Bf0374CDb8c81a1Dedc75C821d',
    lockLP: '0x238b80A701876b3421599650E9A85A10354363DD',
    faucet: '0x49b6431BDcd6CFaf79a3a5309261cB268642d8C0'
}
