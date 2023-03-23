require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();

module.exports = {
  solidity: "0.8.17",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    }
  },
  networks: {
    mainnet: {
      url: process.env.ALCHEMY_MAINNET_URL,
      accounts: [process.env.MAINNET_PRIVATE_KEY]
    },
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_URL,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    },

  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  }
};