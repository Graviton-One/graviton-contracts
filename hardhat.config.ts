import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/.env' });
// require('dotenv').config({ path: __dirname+'/.env' });

import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
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
  solidity: "0.8.0",
};
