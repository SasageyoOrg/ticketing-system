import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/EventFactory'
// import FestivalNFT from '../proxies/Event';
import renderNotification from '../utils/notification-handler';

let web3;

class Festival extends Component {
  constructor() {
    super();
    
    this.state = {
      name: null,
      symbol: null,
      price: null,
      supply: null,
      date: null,
      buttonText: "Pubblica evento",
      buttonEnabled: true
    };
    
    web3 = new Web3(window.ethereum);
  }

  onCreateFestival = async (e) => {
    // indicazione di caricamento nel bottone
    this.setState({buttonText: "Pubblico..."});
    this.setState({ buttonEnabled: false });

    console.log(this.state)
    try {
      e.preventDefault();

      // recupera indirizzo account organizzatore
      const organiser = await web3.eth.getCoinbase();
      const { name, symbol, price, supply, date } = this.state;
      let eventPK = name + symbol + date;
      console.log(eventPK)

      // invocazione del metodo dello smart contract
      // const newEventAddress = 
      await festivalFactory.methods
        .createNewEvent(name, symbol, web3.utils.toWei(price, "ether"), supply, date, eventPK)
        //.send({ from: organiser, gas: 450000 })
        .send({ from: organiser})
        .then((receipt) => {
          console.log(receipt);
        });
      
      // notifica di successo
      renderNotification('success', 'Successo', `Evento creato correttamente!`);

      // indicazione di caricamento nel bottone
      this.setState({buttonText: "Pubblica evento"});
      this.setState({ buttonEnabled: true});

    } catch (err) {
      console.log(err);
      renderNotification('danger', 'Errore: ', 'Evento probabilmente già creato');
      this.setState({ buttonText: "Pubblica evento" });
      this.setState({ buttonEnabled: true });
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
            <label class="left">Nome Evento</label><input id="name" placeholder="Maneskin" type="text" class="validate" name="name" onChange={this.inputChangedHandler} /><br /><br />
            <label class="left">Simbolo Evento</label><input id="symbol" placeholder="SK" type="text" class="validate" name="symbol" onChange={this.inputChangedHandler} /><br /><br />
            <label class="left">Prezzo del biglietto</label><input id="price" placeholder="10" type="text" className="input-control" name="price" onChange={this.inputChangedHandler} /><br /><br />
            <label class="left">Nr. di biglietti</label><input id="supply" placeholder="100" type="text" className="input-control" name="supply" onChange={this.inputChangedHandler}></input><br /><br />
            <label class="left">Data</label><input id="date" placeholder="101022" type="text" className="input-control" name="date" onChange={this.inputChangedHandler}></input><br /><br />

          <button type="submit" disabled={!this.state.buttonEnabled} className="btn waves-effect waves-light">{this.state.buttonText}</button>
          </form>
        </div>
    )
  }
}

export default Festival;
