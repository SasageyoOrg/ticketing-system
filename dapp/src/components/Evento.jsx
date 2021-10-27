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
      var { name, symbol, price, supply, date } = this.state;

      date = parseInt(date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3$2$1'));

      console.log(date);

      let eventPK = name + symbol + date;

      // invocazione del metodo dello smart contract
      //const newEventAddress = 
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

    if(e.target.name === "symbol") {
      e.target.value = e.target.value.toUpperCase();
    } else if(e.target.name === "name") {
      e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
    }

    this.setState(state);
  }

  render() {
    return (
      <div className="container" >
        <h4 className="center page-title">Creazione Evento</h4>
        <form className="form-create-event" onSubmit={this.onCreateFestival}>
          <label className="left validate">Nome evento</label><input id="name" placeholder="Maneskin" type="text" name="name" onChange={this.inputChangedHandler} /><br /><br />
          <label className="left validate">Simbolo evento</label><input id="symbol" placeholder="MSK" type="text" name="symbol" maxlength="3" onChange={this.inputChangedHandler} /><br /><br />
          <label className="left input-control">Prezzo del biglietto (ETH)</label><input id="price" placeholder="10" type="number" name="price" onChange={this.inputChangedHandler} /><br /><br />
          <label className="left input-control">Numero di biglietti</label><input id="supply" placeholder="100" type="number" name="supply" onChange={this.inputChangedHandler}></input><br /><br />
          <label className="left input-control">Data</label><input id="date" type="date" name="date" onChange={this.inputChangedHandler}></input><br /><br />

        <button type="submit" disabled={!this.state.buttonEnabled} className="btn waves-effect waves-light button-submit-form">{this.state.buttonText}</button>
        </form>
      </div>
    )
  }
}

export default Festival;
