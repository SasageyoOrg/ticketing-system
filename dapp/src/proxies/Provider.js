import Web3 from 'web3';

class Provider {
  constructor() {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider('http://127.0.0.1:8545'),
    );
  }
}

export default Provider;