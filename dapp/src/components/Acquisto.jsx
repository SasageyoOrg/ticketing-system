import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/EventFactory';
import FestivalNFT from '../proxies/Event';
import FestivalMarketplace from '../proxies/Reseller';
import renderNotification from '../utils/notification-handler';

let web3;

class Purchase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      festivals: [],
      account: this.props.acc,
    };
    
    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    await this.updateFestivals();
  }

  updateFestivals = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();

      // recupero lista degli eventi
      const eventList = await festivalFactory.methods.getEventList().call({ from: initiator }); 

      // mappo ciascun evento
      const events = await Promise.all(eventList.map(async event => {
        // recupero dettagli evento
        const eventDetails = await festivalFactory.methods.getEventDetails(event).call({ from: initiator });
        const [eventID, eventName, eventSymbol, eventPrice, eventSupply, eventDate] = Object.values(eventDetails);
        // istanza dell'evento
        // const eventInstance = await FestivalNFT(event);

        //console.log(eventInstance);
        

        // html rendering
        return (
          <tr key={event}>
            <td class="center">{eventName}</td>
            <td class="center">{eventSymbol}</td>
            <td class="center">{web3.utils.fromWei(eventPrice, 'ether')}</td>
            <td class="center">{eventSupply}</td>
            <td class="center">{eventDate}</td>

            <td class="center">
            {(this.state.account.type === "cliente")
                ? //<button type="submit" className="custom-btn login-btn" onClick={this.onPurchaseTicket.bind(this, marketplace, ticketPrice, initiator)}>
                  <button type="submit" className="custom-btn login-btn">    
                  Acquista
                  </button>
                : <div></div>
              }
            </td>
          </tr>
        );

      }));

      /*
      const activeFests = await festivalFactory.methods.getActiveFests().call({ from: initiator });
      const fests = await Promise.all(activeFests.map(async fest => {
        const festDetails = await festivalFactory.methods.getFestDetails(fest).call({ from: initiator });
        //const [festName, festSymbol, ticketPrice, totalSupply, marketplace] = Object.values(festDetails);
        const [festName, ticketPrice, totalSupply, marketplace] = Object.values(festDetails);
        const nftInstance = await FestivalNFT(fest);
        const saleId = await nftInstance.methods.getNextSaleTicketId().call({ from: initiator });

        return (
          <tr key={fest}>
            <td class="center">{festName}</td>
            <td class="center">{web3.utils.fromWei(ticketPrice, 'ether')}</td>
            <td class="center">{totalSupply - saleId}</td>

            <td class="center">
            {(this.state.account.type === "cliente")
                ? <button type="submit" className="custom-btn login-btn" onClick={this.onPurchaseTicket.bind(this, marketplace, ticketPrice, initiator)}>
                    Acquista
                  </button>
                : <div></div>
              }
            </td>
          </tr>
        );
      }));
      */

      this.setState({ festivals: events });
    } catch (err) {
      renderNotification('danger', 'Error', err.message);
      console.log('Error while updating the events', err);
    }
  }

  onPurchaseTicket = async (marketplace, ticketPrice, initiator) => {
    try {
      const marketplaceInstance = await FestivalMarketplace(marketplace);
      //await festToken.methods.approve(marketplace, ticketPrice).send({ from: initiator, gas: 6700000 });
      //await marketplaceInstance.methods.purchaseTicket().send({ from: initiator, gas: 6700000, value: ticketPrice });
      await marketplaceInstance.methods
        .purchaseTicket()
        .send({ 
          from: initiator, 
          value: ticketPrice
        })
        .once("receipt", (receipt) => {
          console.log(receipt);
        })
        .catch((err) => {
          console.log(err);
        });
      await this.updateFestivals();

      renderNotification('success', 'Successo', `Biglietto dell'evento acquistato correttamente.`);
    } catch (err) {
      console.log('Error while creating new event', err);
      renderNotification('danger', 'Error', err.message);
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