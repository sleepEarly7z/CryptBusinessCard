require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    viaIR: true
  },
  networks: {
    sepolia: {
        url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
