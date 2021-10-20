import Provider from './Provider';
//import { resellerABI } from '../constants';
import resellerABI from '../abi/contracts/Reseller.json'

const provider = new Provider();

class Reseller {
  constructor(){

    const web3 = provider.web3;
    const deploymentKey = Object.keys(resellerABI.networks)[0];
  
    this.instance = new web3.eth.Contract(
      resellerABI.abi,
      resellerABI.networks[deploymentKey].address,
    );
  };
  // return new web3.eth.Contract(resellerABI, contractAddress);
  getInstance = () => this.instance;
};

const reseller = new Reseller();
Object.freeze(reseller);

console.log(reseller);

export default reseller.getInstance();
