import React, { Component } from 'react';
import Web3 from 'web3';
import eventFactory from '../proxies/EventFactory'
import renderNotification from '../utils/notification-handler';

let web3;

class Festival extends Component {
  constructor() {
    super();
    
    this.state = {
      name: '',
      symbol: '',
      price: null,
      supply: null,
      date: '',

      today: new Date(),

      buttonText: "Pubblica evento",
      buttonEnabled: false
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

      let eventPK = name + symbol + date;

      // invocazione del metodo dello smart contract
      await eventFactory.methods
        .createNewEvent(name, symbol, web3.utils.toWei(price, "ether"), supply, date, eventPK)
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
      if(err.message === 'MetaMask Tx Signature: User denied transaction signature.'){
        renderNotification('danger', 'Errore: ', 'Transazione anullata dal utente');
      } else {
        renderNotification('danger', 'Errore: ', 'Evento probabilmente già creato');
      }
      this.setState({ buttonText: "Pubblica evento" });
      this.setState({ buttonEnabled: true });
    }
  }

  inputChangedHandler = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);

    let inputDate = new Date(this.state.date);
    if(this.state.name != '' && 
       this.state.symbol != '' &&
       this.state.price >= 0 &&
       this.state.supply >= 0 &&
       this.state.date != '' &&
       inputDate > this.state.today) {
        this.setState({buttonEnabled: true})
    } else {
        this.setState({buttonEnabled: false})
    }
  }


  render() {
    return (
      <div class="container" >
        <h4 class="center page-title">Creazione Evento</h4>
        <form class="form-create-event" onSubmit={this.onCreateFestival}>
          <label class="left">Nome evento</label><input id="name" placeholder="Maneskin" type="text" class="validate" name="name" value={this.state.name} onChange={this.inputChangedHandler} /><br /><br />
          <label class="left">Simbolo evento</label><input id="symbol" placeholder="MSK" type="text" class="validate" name="symbol" value={this.state.symbol} onChange={this.inputChangedHandler} /><br /><br />
          <label class="left">Prezzo del biglietto (ETH)</label><input id="price" placeholder="10" type="number" className="input-control" name="price" value={this.state.price} onChange={this.inputChangedHandler} /><br /><br />
          <label class="left">Numero di biglietti</label><input id="supply" placeholder="100" type="number" className="input-control" name="supply" value={this.state.supply} onChange={this.inputChangedHandler}></input><br /><br />
          <label class="left">Data</label><input id="date" type="date" className="input-control" name="date" value={this.state.date} onChange={this.inputChangedHandler}></input><br /><br />

        <button type="submit" disabled={!this.state.buttonEnabled} className="btn waves-effect waves-light button-submit-form">{this.state.buttonText}</button>
        </form>
      </div>
    )
  }
}

export default Festival;
