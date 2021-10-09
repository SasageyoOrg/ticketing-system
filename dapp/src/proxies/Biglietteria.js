import Provider from './Provider';
import { biglietteriaABI } from '../constants';

const provider = new Provider();

const Biglietteria = (contractAddress) => {
  const web3 = provider.web3;

  return new web3.eth.Contract(biglietteriaABI, contractAddress);
};

export default Biglietteria;