import React, { Component } from "react";
import Web3 from "web3";
import festivalFactory from "../proxies/EventFactory"
import FestivalNFT from "../proxies/Event"
import renderNotification from "../utils/notification-handler";

// import Reseller from '../proxies/Reseller';

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
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    this.updateFestivals();
  }

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
    //   let tickets = await nftInstance.methods
    //     .getPurchasedTicketsOfCustomer(initiator)
    //     .call({ from: initiator });
      let tickets = await nftInstance.methods
        .getTicketsToCheck()
        .call({ from: initiator });
      
      const renderData = await Promise.all(
        tickets.map(async (ticket) => {
          const ticketState = await nftInstance.methods.getTicketState(ticket).call({ from: initiator });
          const ticketExposer = await nftInstance.methods
            .getTicketsToCheckExposer(ticket)
            .call({ from: initiator });
          
          return (
            <option key={ticket} value={ticket}>
              {ticket + " - " + ticketExposer.substring(0, 8)+"... : " + ticketState}
            </option>
          );
        })
      );


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
    try {
      const initiator = await web3.eth.getCoinbase();

      const nftInstance = await FestivalNFT(event);
      // const isBuyer = 
      await nftInstance.methods
        .checkTicket(ticketID)
        .send({ from: initiator });

      await this.updateTickets();

      renderNotification('success', 'Successo', `Biglietto dell'evento esibito correttamente.`);
      
    } catch (err) {
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
              <h5 class="page-title" style={{ padding: "30px 0px 0px 10px" }}>Controllo biglietti</h5>
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
                  className="custom-btn login-btn btn waves-effect waves-light button-submit-form"
                  onClick={this.checkIn.bind(
                    this,
                    this.state.fest,
                    this.state.ticket
                  )}
                >
                Controlla</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyTickets;
