import Provider from './Provider';
import EventFactoryABI from '../abi/contracts/EventFactory.json'

const provider = new Provider();

class EventFactory {
  constructor() {
    const web3 = provider.web3;
    const deploymentKey = Object.keys(EventFactoryABI.networks)[0];

    this.instance = new web3.eth.Contract(
      EventFactoryABI.abi,
      EventFactoryABI.networks[deploymentKey].address,
    );
  }

  getInstance = () => this.instance;
}

const eventFactory = new EventFactory();
Object.freeze(eventFactory);

export default eventFactory.getInstance();