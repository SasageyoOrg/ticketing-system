import React, { Component } from 'react';
import renderNotification from '../utils/notification-handler.js';

import eventFactory from '../proxies/EventFactory';
import EventNFT from '../proxies/Event';
import Reseller from '../proxies/Reseller';

import Web3 from 'web3';
let web3;

class Controllore extends Component {

  constructor(props) {
    super(props);

    this.state = {
      ticketsToCheck: [],
      account: this.props.acc,
      eventAddrs: []
    };
    web3 = new Web3(window.ethereum);
  }


  async componentDidMount() {
    await this.updateEvents();
  }

  // TODO: rinominare in updateEvents
  updateEvents = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();

      // recupero lista degli eventi
      const eventList = await eventFactory.methods.getEventList().call({ from: initiator });
      this.setState({ eventAddrs: eventList });

      // mappo ciascun evento
      const events = await Promise.all(eventList.map(async event => {
        // istanza dell'evento
        const eventInstance = EventNFT(event);

        const eventDetails = await eventFactory.methods.getEventDetails(event).call({ from: initiator });
        const [eventID, eventName, eventSymbol, eventPrice, eventSupply, eventDate] = Object.values(eventDetails);

        // recupero dettagli evento
        const data = await eventInstance.methods
          .getTicketsToCheck()
          .call({ from: initiator });
        
        let ticketsToCheck = data.map(async ticket => {

          // console.log(eventInstance);

          // const exposerAddress = await eventInstance.methods.get
          //   .getTicketsToCheckExposer(ticket)
          //   .call({from: initiator});

          // console.log(exposerAddress);
          
          // html rendering
          return (
            <tr key={event}>
              <td class="center">{eventName}</td>
              <td class="center">{eventSymbol}</td>
              <td class="center">{web3.utils.fromWei(eventPrice, "ether")}</td>
              <td class="center">{eventDate}</td>
              <td class="center">{ticket}</td>
              {/* <td class="center">{exposerAddress}</td> */}

              <td class="center">
                
                  <button
                    type="submit"
                    className="custom-btn login-btn">
                    Check Ticket
                  </button>

              </td>
            </tr>
          );
        });

        
        // console.log(eventInstance);
        // const remainingTickets = await eventInstance.methods.getRemainingTickets().call({ from: initiator });
        //console.log(eventInstance);

        this.setState({ ticketsToCheck: ticketsToCheck });

      }));

    } catch (err) {
      renderNotification('danger', 'Error', 'Impossibile recuperare gli eventi. Sono stati creati ?');
      console.log('Error while updating the events', err);
    }
  }



  onPurchaseTicket = async (eventID, eventPrice, initiator) => {
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


      await this.updateEvents();

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
    return (
      <div class="container">
        <table id='requests' class="responsive-table striped" >
          <thead>
            <tr>
              <th key='name' class="center">Evento</th>
              <th key='symbol' class="center">Simbolo</th>
              <th key='price' class="center">Prezzo (ETH)</th>
              <th key='date' class="center">Data</th>
              <th key='id' class="center">Id del biglietto</th>
              <th key='exposer' class="center">Esposto da</th>
              <th key='purchase' class="center">Action</th>
            </tr>
          </thead>
          <tbody class="striped highlight">
            {this.state.ticketsToCheck}
          </tbody>
        </table>
      </div >
    )
  }
}

export default Controllore;


