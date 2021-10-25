import React, { Component } from "react";
import Web3 from "web3";
import festivalFactory from "../proxies/EventFactory"
import FestivalNFT from "../proxies/Event"
import renderNotification from "../utils/notification-handler";

import Reseller from '../proxies/Reseller';

let web3;

class MyTickets extends Component {
  constructor() {
    super();

    this.state = {
      tickets: [],
      fests: [],
      ticket: null,
      fest: null,
      marketplace: null,
      price: null,
      test: null,


      buttonText: "Esibisci",
      buttonEnabled: true
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    this.updateFestivals();
  }

  // onListForSale = async (e) => {
  //   try {
  //     e.preventDefault();
  //     const initiator = await web3.eth.getCoinbase();
  //     const { ticket, price, marketplace } = this.state;
  //     const nftInstance = await FestivalNFT(this.state.fest);
  //     await nftInstance.methods
  //       .setSaleDetails(ticket, web3.utils.toWei(price, "ether"), marketplace)
  //       .send({ from: initiator, gas: 6700000 });

  //     renderNotification(
  //       "success",
  //       "Success",
  //       `Ticket is listed for sale in secondary market!`
  //     );
  //   } catch (err) {
  //     console.log("Error while lisitng for sale", err);
  //     renderNotification(
  //       "danger",
  //       "Error",
  //       err.message.split(" ").slice(8).join(" ")
  //     );
  //   }
  // };

  updateFestivals = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();

      // recupero lista degli eventi
      let eventList = await festivalFactory.methods.getEventList().call({ from: initiator });
      //const activeFests = await festivalFactory.methods.getActiveFests().call({ from: initiator });

      // controllo quanti eventi sono stati ricavati e procedo se >= 1
      if (eventList.length > 0) {
        // recupero dettagli evento
        const renderData = await Promise.all(
          eventList.map(async (event) => {
            const eventDetails = await festivalFactory.methods
              .getEventDetails(event)
              .call({ from: initiator });

            return (
              <option key={event} value={event}>
                {eventDetails[1] + " - " + eventDetails[5]}
              </option>
            );
          })
        );

        this.setState({
          fests: renderData,
          fest: eventList[0]
        });

        this.updateTickets();
      }
    } catch (err) {
      // TODO: bug da risolvere
      renderNotification("danger", "Error", "Error while updating the events");
      console.log("Error while updating the events", err);
    }
  };

  updateTickets = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();

      const nftInstance = await FestivalNFT(this.state.fest);
      let tickets = await nftInstance.methods
        .getPurchasedTicketsOfCustomer(initiator)
        .call({ from: initiator });
      
      const renderData = await Promise.all(
        tickets.map(async (ticket) => {
          const ticketState = await nftInstance.methods.getTicketState(ticket).call({ from: initiator });
          
          return (
            <option key={ticket} value={ticket}>
              {ticket + " - " + ticketState}
            </option>
          );
        })
      );

      // const renderData = tickets.map((ticket) => (
      //   ticketState = await nftInstance.methods
      //   .getTicketState(ticket);

      //   <option key={ticket} value={ticket}>
      //     {ticket} - {ticketState}
      //   </option>
      // ));


      // // codice loro -->
      // const nftInstance = await FestivalNFT(this.state.fest);
      // const tickets = await nftInstance.methods
      //   .getTicketsOfCustomer(initiator)
      //   .call({ from: initiator });
      // const renderData = tickets.map((ticket, i) => (
      //   <option key={ticket} value={ticket}>
      //     {ticket}
      //   </option>
      // ));

      this.setState({ tickets: renderData, ticket: tickets[0] });
    } catch (e) {
      // TODO: bug da risolvere
      renderNotification("danger", "Error", "Error in updating the ticket for the event");
      console.log("Error in updating the ticket", e);
    }
  };

  onFestivalChangeHandler = async (e) => {
    try {
      const state = this.state;
      state[e.target.name] = e.target.value;
      this.setState(state);

      const { fest } = this.state;
      await this.updateTickets(fest);

      const initiator = await web3.eth.getCoinbase();
      // const festDetails = 
      await festivalFactory.methods
        .getEventDetails(fest)
        .call({ from: initiator });

      //this.setState({ marketplace: festDetails[4] });
    } catch (err) {
      console.log("Error while tickets for the event", err.message);
      renderNotification(
        "danger",
        "Error",
        "Error while tickets for the event"
      );
    }
  };

  selectHandler = (e) => {
    this.setState({ ticket: e.target.value });
  };

  inputChangedHandler = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  };

  checkIn = async (event, ticketID) => {
    this.setState({ buttonText: "Esibizione del biglietto..." });
    this.setState({ buttonEnabled: false });
    try {
      const initiator = await web3.eth.getCoinbase();
      
      console.log("event: ", event);
      console.log("tick: ", ticketID);

      await Reseller.methods.checkIN(event, initiator, ticketID).send({ from: initiator });
      
      await this.updateTickets();

      renderNotification('success', 'Successo', `Biglietto dell'evento esibito correttamente.`);

      // const ticketState = await nftInstance.methods.getTicketState(ticketID).call({ from: initiator });
      // console.log(ticketState);

      // console.log(result);

      // const marketplaceInstance = await Reseller();

      //await festToken.methods.approve(marketplace, eventPrice).send({ from: initiator, gas: 6700000 });
      //await marketplaceInstance.methods.purchaseTicket().send({ from: initiator, gas: 6700000, value: eventPrice });

      // // console.log(Reseller)
      // await Reseller.methods
      //   .purchaseTicket(this.state.eventAddrs[eventID - 1])
      //   .send({
      //     from: initiator,
      //     value: eventPrice,
      //   })
      //   .once("receipt", (receipt) => {
      //     // console.log(receipt);
      //   })
      //   .catch((err) => {
      //     // console.log(err);
      //   });


      // await this.updateFestivals();

      // renderNotification('success', 'Successo', `Biglietto dell'evento acquistato correttamente.`);
      this.setState({ buttonText: "Esibito" });
      this.setState({ buttonEnabled: true });

      
    } catch (err) {
      this.setState({ buttonText: "Esibisci" });
      this.setState({ buttonEnabled: true });
      console.log('Error while showing the ticket', err);
      renderNotification('danger', 'Error', err.message);
    }
  }

  render() {
    return (
      <div class="container center">
        <div class="row">
          <div class="container ">
            <div class="container ">
              <h5 style={{ padding: "30px 0px 0px 10px" }}>I miei biglietti</h5>
              <form class="" onSubmit={this.onListForSale}>
                <label class="left">Evento</label>
                <select
                  className="browser-default"
                  name="fest"
                  value={this.state.fest || undefined}
                  onChange={this.onFestivalChangeHandler}
                >
                  <option value="" disabled>
                    Seleziona l'evento
                  </option>
                  {this.state.fests}
                </select>
                <br />
                <br />

                <label class="left">Biglietto</label>
                <select
                  className="browser-default"
                  name="ticket"
                  value={this.state.ticket || undefined}
                  onChange={this.selectHandler}
                >
                  <option value="" disabled>
                    Seleziona il biglietto
                  </option>
                  {this.state.tickets}
                </select>
                <br />
                <br />
                <button 
                  type="button" 
                  className="btn waves-effect waves-light"
                  disabled={!this.state.buttonEnabled}
                  onClick={this.checkIn.bind(
                    this,
                    this.state.fest,
                    this.state.ticket
                  )}
                >
                {this.state.buttonText}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyTickets;
