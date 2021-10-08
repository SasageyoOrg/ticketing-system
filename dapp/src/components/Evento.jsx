import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/CreazioneEvento';
import FestivalNFT from '../proxies/NFTEvento';
import renderNotification from '../utils/notification-handler';

let web3;

class Festival extends Component {
  constructor() {
    super();

    this.state = {
      name: null,
      price: null,
      supply: null,
    };
    
    web3 = new Web3(window.ethereum);
  }

  onCreateFestival = async (e) => {
    try {
      e.preventDefault();

      // recupera indirizzo account organizzatore
      const organiser = await web3.eth.getCoinbase();
      const { name, price, supply } = this.state;
      // invocazione del metodo dello smart contract
      const { events: { Created: { returnValues: { ntfAddress, marketplaceAddress } } } } = await festivalFactory.methods.createNewFest(
        name,
        web3.utils.toWei(price, 'ether'),
        supply
      ).send({ from: organiser, gas: 6700000 });
      // notifica di successo
      renderNotification('success', 'Successo', `Evento creato correttamente!`);
      
      // processo di bulk minting
      const nftInstance = await FestivalNFT(ntfAddress);
      const batches = Math.ceil(supply / 30);
      let batchSupply = 30;
      let curCount = 0
      let prevCount = 0

      if (supply < 30) {
        // minting dei tickets
        await nftInstance.methods.bulkMintTickets(supply, marketplaceAddress).send({ from: organiser, gas: 6700000 });
      } else {
        // minting a blocchi di 30 tickets
        for (let i = 0; i < batches; i++) {
          prevCount = curCount;
          curCount += 30;
          if (supply < curCount) {
            batchSupply = supply - prevCount;
          }

          await nftInstance.methods.bulkMintTickets(batchSupply, marketplaceAddress).send({ from: organiser, gas: 6700000 });
        }
      }

      
    } catch (err) {
      console.log('Errore: ', err);
      renderNotification('danger', 'Errore', 'Si è verificato un problema durante il caricamento del nuovo evento');
    }
  }

  inputChangedHandler = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  }


  render() {
    return (
      <div class="container" >
          <h4 class="center">Creazione Evento</h4>
          <form class="" onSubmit={this.onCreateFestival}>
            <label class="left">Nome Evento</label><input id="name" placeholder="es. Maneskin" type="text" class="validate" name="name" onChange={this.inputChangedHandler} /><br /><br />
            <label class="left">Prezzo del biglietto</label><input id="price" placeholder="ETH" type="text" className="input-control" name="price" onChange={this.inputChangedHandler} /><br /><br />
            <label class="left">Nr. di biglietti</label><input id="supply" placeholder="es. 100" type="text" className="input-control" name="supply" onChange={this.inputChangedHandler}></input><br /><br />

            <button type="submit" className="custom-btn login-btn">Crea evento</button>
          </form>
        </div>
    )
  }
}

export default Festival;
