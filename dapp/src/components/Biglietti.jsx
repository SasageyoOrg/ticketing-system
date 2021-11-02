import React, { Component } from "react";
import Web3 from "web3";
import festivalFactory from "../proxies/EventFactory";
import FestivalNFT from "../proxies/Event";
import renderNotification from "../utils/notification-handler";

import Reseller from "../proxies/Reseller";

let web3;

class MyTickets extends Component {
  constructor() {
    super();

    this.state = {
      tickets: [],
      empty: false
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    // await this.updateFestivals();

    // WIP
    await this.loadTickets();

    // console.log(this.state);
    // const nftInstance = await FestivalNFT(this.state.fest);
    // const ticketState = await nftInstance.methods
    //         .getTicketState(this.state.ticket)
    //         .call();
    // console.log(ticketState)
    // if(this.ticketState === 'esibito'){
    // 	this.setState({buttonEnabled: false})
    // }
  }

  stringToColour = function (str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = "#";
    for (i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xff;
      colour += ("00" + value.toString(16)).substr(-2);
    }
    return colour;
  };

  loadTickets = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();

      // recupero lista degli eventi
      let eventList = await festivalFactory.methods
        .getEventList()
        .call({ from: initiator });

      // popolata per il rendering dei tickets
      let renderData = [];
      let buttonText = "Esibisci";

      // verifico che esista almeno 1 evento
      if (eventList.length > 0) {
        eventList.map(async (event) => {
          // creo istanza NFT dell'evento
          const nftInstance = await FestivalNFT(event);

          // recupero i biglietti del cliente per ogni evento
          let tickets = await nftInstance.methods
            .getPurchasedTicketsOfCustomer(initiator)
            .call({ from: initiator });

          // verifico se è stato acquistato almeno un biglietto per ogni evento
          if (tickets.length > 0) {
            const renderTicket = await Promise.all(
              tickets.map(async (ticket) => {
                // recupero info dell'evento
                const eventDetails = await festivalFactory.methods
                  .getEventDetails(event)
                  .call({ from: initiator });

                // recupero info del biglietto
                const ticketState = await nftInstance.methods
                  .getTicketState(ticket)
                  .call({ from: initiator });

                // correzzione data
                let tmp_date = eventDetails[5];
                if (tmp_date.length === 7) {
                  tmp_date = "0" + tmp_date;
                }
                var dateFormat =
                  tmp_date.substring(0, 2) +
                  "/" +
                  tmp_date.substring(2, 4) +
                  "/" +
                  tmp_date.substring(4, 8);

                // controllo se il biglietto è stato esibito
                let buttonState = (ticketState === "esibito" || ticketState === "accettato") ? true : false;
                let ticketColor = this.stringToColour(eventDetails[1]);

                return (
                  <div className="ticket" key={ticket}>
                    <div
                      className="ticket-event-color"
                      style={{ background: ticketColor }}
                    ></div>
                    <span className="ticket-event-name">{eventDetails[1]}</span>
                    <span className="ticket-event-date">
                      Data: <b>{dateFormat}</b>
                    </span>
                    <span className="ticket-id">
                      Ticket ID: <b>{ticket}</b>
                    </span>
                    <span className="ticket-state">
                      Stato: <b>{ticketState}</b>
                    </span>
                    <button
                      type="button"
                      className="btn waves-effect waves-light"
                      disabled={buttonState}
                      onClick={this.checkIn.bind(this, event, ticket)}
                    >
                      {buttonText}
                    </button>
                  </div>
                );
              })
            );

            // salvo i dati dei ticket acquistati nel React state
            renderData.push(renderTicket);
            this.setState({ tickets: renderData });
          }
        });
      }

      // if(this.state.tickets.length === 0)  {
      //   this.setState({ empty: true });
      // }

      // this.setState({ tickets: renderData });
    } catch (err) {
      // TODO: bug da risolvere
      renderNotification(
        "danger",
        "Error",
        "Error while updating the events #2"
      );
      console.log("Error while updating the events #2", err);
    }
  };

  checkIn = async (event, ticketID) => {
    document.querySelectorAll("button").forEach((elem) => {
      if (elem.disabled === false) {
        elem.childNodes[0].nodeValue = "Esibisco..."
        elem.disabled = true;
      }
    });

    try {
      const initiator = await web3.eth.getCoinbase();

      await Reseller.methods
        .checkIN(event, initiator, ticketID)
        .send({ from: initiator });

      renderNotification(
        "success",
        "Successo",
        "Biglietto dell'evento esibito correttamente."
      );

      await this.loadTickets();

      // ripristino stato bottoni
      document.querySelectorAll("button").forEach((elem) => {
        if (elem.disabled === true && elem.childNodes[0].nodeValue === "...") {
          elem.childNodes[0].nodeValue = "Esibisci";
          elem.disabled = false;
        }
      });
    } catch (err) {
      if (err.code === 4001) {
        setTimeout(window.location.reload(), 1000);
      } else {
        renderNotification("danger", "Errore", err.message);
      }
    }
  };

  render() {
    return (
      <div className="container center">
        <h4 className="page-title center">I miei biglietti</h4>
        {this.state.empty ? (
          <div className="emptyMessage">Acquista un biglietto per visualizzarlo qui</div>
        ) : (
          <div className="tickets-wrapper">{this.state.tickets}</div>
        )}
      </div>
    );
  }

}

export default MyTickets;
