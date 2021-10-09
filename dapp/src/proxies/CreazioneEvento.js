import Provider from './Provider';
import CreazioneEventoABI from '../abi/contracts/CreazioneEvento.json';

const provider = new Provider();

class CreazioneEvento {
  constructor() {
    const web3 = provider.web3;
    const deploymentKey = Object.keys(CreazioneEventoABI.networks)[0];

    this.instance = new web3.eth.Contract(
      CreazioneEventoABI.abi,
      CreazioneEventoABI.networks[deploymentKey].address,
    );
  }

  getInstance = () => this.instance;
}

const creazioneEvento = new CreazioneEvento();
Object.freeze(creazioneEvento);

export default creazioneEvento.getInstance();