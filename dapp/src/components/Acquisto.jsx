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

          // correzzione data
          let tmp_date = eventDate;
          if(tmp_date.length == 7) {
            tmp_date = "0" + tmp_date;
          }
          var dd = tmp_date.substring(0,2);
          var mm = tmp_date.substring(2,4);
          var yyyy = tmp_date.substring(4,8);
          var dateFormat = dd + '/' + mm + '/' + yyyy;

          // istanza dell'evento
          const eventInstance = EventNFT(event);
          const remainingTickets = await eventInstance.methods
            .getRemainingTickets()
            .call({ from: initiator });
          
          let supplyClassName = (remainingTickets !== "0") ? "available" : "soldout";

          // html rendering
          return (
            <tr key={event} type={supplyClassName}>
              <td className="center">{eventName}</td>
              <td className="center">{eventSymbol}</td>
              <td className="center">{web3.utils.fromWei(eventPrice, "ether")}</td>
              <td className="center">
                {remainingTickets === "0" ? "SOLD OUT" : remainingTickets}
              </td>
              <td className="center">{dateFormat}</td>

              <td className="center">
                {this.state.account.type === "cliente" &&
                remainingTickets !== "0" ? (
                  <button
                    type="submit"
                    className="btn waves-effect waves-light buy-button"
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
    this.setState({ buttonText: "..." });
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
      pageTitle = <h4 className="page-title center">Eventi disponibili</h4>;
    } else {
      pageTitle = <h4 className="page-title center">Acquista biglietti</h4>;
    }
    return (
      <div className="container center">
        {pageTitle}
        <table id="requests" className="responsive-table striped">
          <thead>
            <tr>
              <th key="name" className="center">
                Evento
              </th>
              <th key="symbol" className="center">
                Simbolo
              </th>
              <th key="price" className="center">
                Prezzo (ETH)
              </th>
              <th key="left" className="center">
                Biglietti rimanenti
              </th>
              <th key="date" className="center">
                Data
              </th>
              {this.state.account.type === "cliente" ? (
                <th key="purchase" className="center"></th>
              ) : (
                <div></div>
              )}
            </tr>
          </thead>
          <tbody className="striped highlight">{this.state.events}</tbody>
        </table>
      </div>
    );
  }
}

export default Purchase;
