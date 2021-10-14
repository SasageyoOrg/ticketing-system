import Provider from './Provider';
//import { EventNFTABI } from '../constants';
import EventABI from '../abi/contracts/Event.json'

const provider = new Provider();

const EventNFT = (contractAddress) => {
  const web3 = provider.web3;

  return new web3.eth.Contract(EventABI, contractAddress);
};

export default EventNFT;