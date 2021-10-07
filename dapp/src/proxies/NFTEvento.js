import Provider from './Provider';
import { EventoNFTABI } from '../constants';

const provider = new Provider();

const EventoNFT = (contractAddress) => {
  const web3 = provider.web3;

  return new web3.eth.Contract(EventoNFTABI, contractAddress);
};

export default EventoNFT;