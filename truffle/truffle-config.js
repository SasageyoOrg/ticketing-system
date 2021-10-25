module.exports = {
  networks: {
    quorum: {
      host: "127.0.0.1", // truffle test
      port: 22000,  // node 1
      network_id: "*", // "*" -> Match any network id | "10" -> quorum wizard network id
      type: "quorum",
      gasPrice: 0
      // gas: 8000000,
    },
  },
  compilers: {
    solc: {
      version: "0.6.2",
      parser: "solcjs", // Leverages solc-js purely for speedy parsing
      settings: {
        optimizer: {
          enabled: true,
        }
      },
    },
  },
};
