module.exports = {
  networks: {
    development: {
      host: "172.16.239.15", // rpcnode
      port: 8545, // 8545
      network_id: "1337", // "*" -> Match any network id
      type: "quorum",
      gasPrice: 0
    }
  },

  db: {
    enabled: false
  },
  
  compilers: {
    solc: {
      version: "^0.6.0",    // Fetch exact version from solc-bin (default: truffle's version)
      docker: false,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "petersburg"
      }
    }
  }
};