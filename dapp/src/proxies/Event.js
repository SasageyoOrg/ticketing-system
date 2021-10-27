import Provider from './Provider';
import EventABI from '../abi/contracts/Event.json'

const provider = new Provider();

const EventNFT = (contractAddress) => {
  const web3 = provider.web3;
  const instance = new web3.eth.Contract(EventABI.abi, contractAddress);
  return instance;
};

export default EventNFT;