import Web3 from 'web3';

class Provider {
  constructor() {
    /*
    this.web3 = new Web3(
      new Web3.providers.HttpProvider('http://127.0.0.1:8545'),
    );
    */

    // new method as suggested here: https://stackoverflow.com/a/67027947
    // reason: "Metamask doesn't inject web3 anymore"
    this.web3 = new Web3(window.ethereum);
    
  }
}

export default Provider;