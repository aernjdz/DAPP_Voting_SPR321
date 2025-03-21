require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    // Local development network
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    // Hardhat's built-in network (automatically runs when you run scripts)
    hardhat: {
      chainId: 31337
    },
    // You can add other networks like testnets or mainnets here
  },
};
