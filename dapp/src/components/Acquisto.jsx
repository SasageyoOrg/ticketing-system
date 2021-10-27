import React, { Component } from "react";
import renderNotification from "../utils/notification-handler.js";

import eventFactory from "../proxies/EventFactory";
import EventNFT from "../proxies/Event";
import Reseller from "../proxies/Reseller";

import Web3 from "web3";
let web3;

class Purchase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: this.props.acc,
      events: [],
      eventAddrs: [],
      buttonText: "Acquista",
      buttonEnabled: true,
    };
    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    await this.updateEvents();
  }

  //Fetch degli eventi
  updateEvents = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();

      // recupero lista degli eventi
      const eventList = await eventFactory.methods
        .getEventList()
        .call({ from: initiator });
      this.setState({ eventAddrs: eventList });

      // mappo ciascun evento
      const events = await Promise.all(
        eventList.map(async (event) => {
          // recupero dettagli evento
          const eventDetails = await eventFactory.methods
            .getEventDetails(event)
            .call({ from: initiator });
          const [eventID, eventName, eventSymbol, eventPrice, , eventDate] =
            Object.values(eventDetails);

          var dd = eventDate.substring(0,2);
          var mm = eventDate.substring(2,4);
          var yyyy = eventDate.substring(4,8);
          var dateFormat = dd + '/' + mm + '/' + yyyy;

          // istanza dell'evento
          const eventInstance = EventNFT(event);
          const remainingTickets = await eventInstance.methods
            .getRemainingTickets()
            .call({ from: initiator });

          // html rendering
          return (
            <tr key={event}>
              <td class="center">{eventName}</td>
              <td class="center">{eventSymbol}</td>
              <td class="center">{web3.utils.fromWei(eventPrice, "ether")}</td>
              <td class="center">
                {remainingTickets === "0" ? "SOLD OUT" : remainingTickets}
              </td>
              <td class="center">{dateFormat}</td>

              <td class="center">
                {this.state.account.type === "cliente" &&
                remainingTickets !== "0" ? (
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
        })
      );

      this.setState({ events: events });
    } catch (err) {
      renderNotification(
        "danger",
        "Error",
        "Impossibile recuperare gli eventi. Sono stati creati ?"
      );
      console.log("Error while updating the events", err);
    }
  };

  //Gestione dell'acquisto
  onPurchaseTicket = async (eventID, eventPrice, initiator) => {
    this.setState({ buttonText: "Acquisto in corso..." });
    this.setState({ buttonEnabled: false });
    await this.updateEvents();

    try {
      await Reseller.methods
        .purchaseTicket(this.state.eventAddrs[eventID - 1])
        .send({
          from: initiator,
          value: eventPrice,
        });

      this.setState({ buttonText: "Acquista" });
      this.setState({ buttonEnabled: true });
      await this.updateEvents();
      this.props.loadBlockChain();

      renderNotification(
        "success",
        "Successo",
        "Biglietto dell'evento acquistato correttamente."
      );
    } catch (err) {
      console.log(err);
      renderNotification(
        "danger",
        "Error",
        "Errore durante l'acquisto. Ci sono ancora biglietti ?"
      );
    }
  };

  inputChangedHandler = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  };

  render() {
    let pageTitle;

    if (this.state.account.type === "organizzatore") {
      pageTitle = <h4 class="center page-title">Eventi disponibili</h4>;
    } else {
      pageTitle = <h4 class="center page-title">Acquista biglietti</h4>;
    }
    return (
      <div class="container">
        {pageTitle}
        <table id="requests" class="responsive-table striped">
          <thead>
            <tr>
              <th key="name" class="center">
                Evento
              </th>
              <th key="symbol" class="center">
                Simbolo
              </th>
              <th key="price" class="center">
                Prezzo (ETH)
              </th>
              <th key="left" class="center">
                Biglietti rimanenti
              </th>
              <th key="date" class="center">
                Data
              </th>
              {this.state.account.type === "cliente" ? (
                <th key="purchase" class="center"></th>
              ) : (
                <div></div>
              )}
            </tr>
          </thead>
          <tbody class="striped highlight">{this.state.events}</tbody>
        </table>
      </div>
    );
  }
}

export default Purchase;
