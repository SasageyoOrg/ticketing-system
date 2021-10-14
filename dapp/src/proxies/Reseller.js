import Provider from './Provider';
//import { resellerABI } from '../constants';
import resellerABI from '../abi/contracts/Reseller.json'

const provider = new Provider();

const Reseller = (contractAddress) => {
  const web3 = provider.web3;

  return new web3.eth.Contract(resellerABI, contractAddress);
};

export default Reseller;