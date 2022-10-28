require("ts-node").register({
  files: true,
});

module.exports = {
  
  networks: {

    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },

  },

  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      gasPrice: 1,
      token: 'ETH',
      showTimeSPent: true,
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.17", // Fetch exact version from solc-bin (default: truffle's version)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: false,
         runs: 200
       },
      }
    }
  },
};