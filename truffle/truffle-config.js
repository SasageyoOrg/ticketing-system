module.exports = {
  networks: {
    development: {
      // host: "172.16.239.15", // quorum rpcnode
      host: "127.0.0.1", // truffle test
      port: 22000,
      network_id: "*", // "*" -> Match any network id | "1337" -> quorum network id
      type: "quorum",
      gasPrice: 0
      // gas: "0x1ffffffffffffe"
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
