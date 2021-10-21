import Provider from './Provider';
//import { EventNFTABI } from '../constants';
import EventABI from '../abi/contracts/Event.json'

const provider = new Provider();

const EventNFT = (contractAddress) => {
  const web3 = provider.web3;

  // console.log('addr: ' + contractAddress);

  const instance = new web3.eth.Contract(EventABI.abi, contractAddress);

  // console.log('istanza: ' + instance);

  return instance;
};

export default EventNFT;