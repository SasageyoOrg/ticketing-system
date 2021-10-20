import Provider from './Provider';
//import { EventNFTABI } from '../constants';
import EventABI from '../abi/contracts/Event.json'

const provider = new Provider();

const EventNFT = (contractAddress) => {
  const web3 = provider.web3;
  console.log("contractAddress", contractAddress);

  const contractInstance = new web3.eth.Contract(EventABI.abi, contractAddress);
  console.log(contractInstance);

  return contractInstance;
};

export default EventNFT;

// import Provider from "./Provider";
// import EventNFTABI from "../abi/contracts/Event.json";

// const provider = new Provider();

// class EventNFT {
//   constructor() {
//     const web3 = provider.web3;
//     // const deploymentKey = Object.keys(EventNFTABI.networks)[0];

//     this.instance = new web3.eth.Contract(
//       EventNFTABI.abi,
//       contractAddress
//     );
//   }

//   getInstance = () => this.instance;
// }

// const event = new EventNFT();
// // Object.freeze(event);

// console.log(event);

// export default event.getInstance();
