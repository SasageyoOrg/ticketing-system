import React, { Component } from 'react';
import renderNotification from '../utils/notification-handler.js';

import festivalFactory from '../proxies/EventFactory';
import EventNFT from '../proxies/Event';
import Reseller from '../proxies/Reseller';

import Web3 from 'web3';
let web3;

class Purchase extends Component {

  constructor(props) {
    super(props);

    this.state = {
      festivals: [],
      account: this.props.acc,
      eventAddrs : [],
      buttonText: "Acquista",
      buttonEnabled: true
    };
    web3 = new Web3(window.ethereum);
  }


  async componentDidMount() {
    await this.updateFestivals();
  }

  // TODO: rinominare in updateEvents
  updateFestivals = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();

      // recupero lista degli eventi
      const eventList = await festivalFactory.methods.getEventList().call({ from: initiator }); 
      this.setState({eventAddrs:eventList});

      // mappo ciascun evento
      const events = await Promise.all(eventList.map(async event => {

        // recupero dettagli evento
        const eventDetails = await festivalFactory.methods.getEventDetails(event).call({ from: initiator });
        const [eventID, eventName, eventSymbol, eventPrice, , eventDate] = Object.values(eventDetails);
        // istanza dell'evento
        const eventInstance = EventNFT(event);
        // console.log(eventInstance);
        const remainingTickets = await eventInstance.methods.getRemainingTickets().call({ from: initiator });
        //console.log(eventInstance);

        // html rendering
        return (
          <tr key={event}>
            <td class="center">{eventName}</td>
            <td class="center">{eventSymbol}</td>
            <td class="center">{web3.utils.fromWei(eventPrice, "ether")}</td>
            <td class="center">{(remainingTickets === "0")? "SOLD OUT" : remainingTickets}</td>
            <td class="center">{eventDate}</td>

            <td class="center">
              {this.state.account.type === "cliente" ? (
                //<button type="submit" className="custom-btn login-btn" onClick={this.onPurchaseTicket.bind(this, marketplace, eventPrice, initiator)}>
                <button
                  type="submit"
                  className="btn waves-effect waves-light"
                  disabled={!this.state.buttonEnabled}
                  onClick={this.onPurchaseTicket.bind(
                    this,
                    eventID,
                    eventPrice,
                    initiator
                  )}
                >
                  {this.state.buttonText}
                </button>
              ) : (
                <div></div>
              )}
            </td>
          </tr>
        );

      }));

      this.setState({ festivals: events });
    } catch (err) {
      renderNotification('danger', 'Error', 'Impossibile recuperare gli eventi. Sono stati creati ?');
      console.log('Error while updating the events', err);
    }
  }



  onPurchaseTicket = async (eventID, eventPrice, initiator) => {
    this.setState({ buttonText: "Acquisto in corso..." });
    this.setState({ buttonEnabled: false });
    await this.updateFestivals();


    try {
      // const marketplaceInstance = await Reseller();

      //await festToken.methods.approve(marketplace, eventPrice).send({ from: initiator, gas: 6700000 });
      //await marketplaceInstance.methods.purchaseTicket().send({ from: initiator, gas: 6700000, value: eventPrice });

      // console.log(Reseller)
      await Reseller.methods
        .purchaseTicket(this.state.eventAddrs[eventID - 1])
        .send({
          from: initiator,
          value: eventPrice,
        })
        .once("receipt", (receipt) => {
          // console.log(receipt);
        })
        .catch((err) => {
          // console.log(err);
        });

        
      this.setState({ buttonText: "Acquista" });
      this.setState({ buttonEnabled: true });
      await this.updateFestivals();
      this.props.loadBlockChain();

      renderNotification('success', 'Successo', `Biglietto dell'evento acquistato correttamente.`);
      
    } catch (err) {
      console.log('Error while creating new event', err);
      renderNotification('danger', 'Error', err.message);
      this.setState({ buttonText: "Acquista" });
      this.setState({ buttonEnabled: true });
    }

    
  }


  inputChangedHandler = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  }


  render() {
    let pageTitle

    if (this.state.account.type === "organizzatore") {
      pageTitle = (
        <h4 class="center">Eventi disponibili</h4>
      );
    } else {
      pageTitle = (
        <h4 class="center">Acquista biglietti</h4>
      );
    }
    return (
      <div class="container">
        {pageTitle}
        <table id='requests' class="responsive-table striped" >
          <thead>
            <tr>
              <th key='name' class="center">Evento</th>
              <th key='symbol' class="center">Simbolo</th>
              <th key='price' class="center">Prezzo (ETH)</th>
              <th key='left' class="center">Biglietti rimanenti</th>
              <th key='date' class="center">Data</th>
              {(this.state.account.type === "cliente")
                ? <th key='purchase' class="center"></th>
                : <div></div>
              }
            </tr>
          </thead>
          <tbody class="striped highlight">
            {this.state.festivals}
          </tbody>
        </table>
      </div >
    )
  }
}

export default Purchase;