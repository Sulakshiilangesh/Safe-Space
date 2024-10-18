require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",
  networks: {
      sepolia: {
          url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
          accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`]
      }}
};