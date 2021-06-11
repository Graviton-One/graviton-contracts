import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/.env' });

import { task } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: "0.8.0",
  networks: {
    hardhat: {
    },
    fantom: { // 250
      url: "https://rpcapi.fantom.network",
      accounts: { mnemonic: process.env.MNEMONIC }
    },
    bsc: { // 56
      url: "https://bsc-dataseed.binance.org",
      accounts: { mnemonic: process.env.MNEMONIC }
    },
    polygon: { // 137
      url: "https://rpc-mainnet.matic.network",
      accounts: { mnemonic: process.env.MNEMONIC }
    },
    heco: { // 128
      url: "https://http-mainnet.hecochain.com",
      accounts: { mnemonic: process.env.MNEMONIC }
    },
    avax: { // 43114
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: { mnemonic: process.env.MNEMONIC }
    },
    xdai: { // 100
      url: "https://rpc.xdaichain.com",
      accounts: { mnemonic: process.env.MNEMONIC }
    }
  },
  etherscan: {
    apiKey: process.env.APIKEY
  },
};
