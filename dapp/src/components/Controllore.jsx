import React, { Component } from "react";
import Web3 from "web3";
import eventFactory from "../proxies/EventFactory";
import EventNFT from "../proxies/Event";
import renderNotification from "../utils/notification-handler";

let web3;

class MyTickets extends Component {
  constructor() {
    super();

    this.state = {
      tickets: [],
      buttonText: "Controlla",
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    this.loadTicketsToCheck();
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

  loadTicketsToCheck = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();

      // popolata per il rendering dei tickets
      let renderData = [];

      // recupero lista degli eventi
      let eventList = await eventFactory.methods
        .getEventList()
        .call({ from: initiator });

      // verifico che esista almeno 1 evento
      if (eventList.length > 0) {
        eventList.map(async (event) => {
          // recupero dettagli evento
          const eventDetails = await eventFactory.methods
              .getEventDetails(event)
              .call({ from: initiator });

          // creo istanza NFT dell'evento
          const nftInstance = await EventNFT(event);

          // recupero i ticket esibiti da controllare
          let ticketsToCheck = await nftInstance.methods
            .getTicketsToCheck()
            .call({ from: initiator });

          // verifico se è stato esibito almeno un biglietto per ogni evento
          if (ticketsToCheck.length > 0) {
            const renderTickets = await Promise.all(
              ticketsToCheck.map(async (ticket) => {
                // recupero lo stato del biglietto
                const ticketState = await nftInstance.methods
                .getTicketState(ticket)
                .call({ from: initiator });
                
                // recupero l'indirizzo dell'account (wallet) che ha esibito il biglietto
                const ticketExposer = await nftInstance.methods
                .getTicketsToCheckExposer(ticket)
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

                let buttonState = false;
                if(ticketState === "accettato" || ticketState === "rifiutato") {
                  buttonState = true;
                } else if(this.state.buttonText === "...") {
                  buttonState = true;
                }

                let ticketColor = this.stringToColour(eventDetails[1]);
                
                return (
                  <div className="ticket tickettocheck" key={ticket}>
                    <div
                      className="ticket-event-color tectocheck"
                      style={{ background: ticketColor }}
                    ></div>
                    <span className="ticket-event-name">{eventDetails[1]}</span>
                    <span className="ticket-event-date">
                      Data: <b>{dateFormat}</b>
                    </span>
                    <span className="ticket-id">
                      Ticket ID: <b>{ticket}</b>
                    </span>
                    <span className="ticket-exposer">
                      Utente: <b>{ticketExposer.substring(0, 12)}...</b>
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
                      {this.state.buttonText}
                    </button>
                  </div>
                );
              })
            );

            // salvo i dati dei ticket esibiti nel React state
            renderData.push(renderTickets);
            this.setState({ tickets: renderData });
          }
        });
      }
    } catch (err) {
      renderNotification(
        "danger",
        "Error",
        "Si è verificato un problema durante il caricamento dei ticket"
      );
      console.log(
        "Si è verificato un problema durante il caricamento dei ticket",
        err
      );
    }
  };

  checkIn = async (event, ticketID) => {
    this.setState({ buttonText: "..." });

    try {
      await this.loadTicketsToCheck();

      const initiator = await web3.eth.getCoinbase();

      const nftInstance = await EventNFT(event);
      await nftInstance.methods.checkTicket(ticketID).send({ from: initiator });
      
      this.setState({ buttonText: "Controlla" });

      await this.loadTicketsToCheck();

      renderNotification(
        "success",
        "Successo",
        `Biglietto dell'evento accettato.`
      );
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
        <h4 className="page-title center">Controllo biglietti</h4>
        {this.state.empty ? (
          <div className="emptyMessage">Nessun biglietto esibito da controllare</div>
        ) : (
          <div className="tickets-wrapper">{this.state.tickets}</div>
        )}
      </div>
    );
  }
}

export default MyTickets;