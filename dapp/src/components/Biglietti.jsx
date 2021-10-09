import React, { Component } from "react";
import Web3 from "web3";
import creazioneEvento from "../proxies/CreazioneEvento";
import EventoNFT from "../proxies/NFTEvento";
import renderNotification from "../utils/notification-handler";

let web3;

class MyTickets extends Component {
  constructor() {
    super();

    this.state = {
      biglietti: [],
      eventi: [],
      biglietto: null,
      evento: null,
      biglietteria: null,
      prezzo: null,
      test: null,
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    await this.aggiornaEventi();
  }

  onListForSale = async (e) => {
    try {
      e.preventDefault();
      const initiator = await web3.eth.getCoinbase();
      const { biglietto, prezzo, biglietteria } = this.state;
      const nftInstance = await EventoNFT(this.state.evento);
      await nftInstance.methods
        .setSaleDetails(biglietto, web3.utils.toWei(prezzo, "ether"), biglietteria)
        .send({ from: initiator, gas: 6700000 });

      renderNotification(
        "success",
        "Success",
        `Ticket is listed for sale in secondary market!`
      );
    } catch (err) {
      console.log("Error while lisitng for sale", err);
      renderNotification(
        "danger",
        "Error",
        err.message.split(" ").slice(8).join(" ")
      );
    }
  };

  aggiornaEventi = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();
      const eventiAttivi = await creazioneEvento.methods
        .getEventiAttivi()
        .call({ from: initiator });

      const dettagliEvento = await creazioneEvento.methods
        .getDettagliEvento(eventiAttivi[0])
        .call({ from: initiator });

      const renderData = await Promise.all(
        eventiAttivi.map(async (evento, i) => {
          const dettagliEvento = await creazioneEvento.methods
            .getDettagliEvento(eventiAttivi[i])
            .call({ from: initiator });


          return (
            <option key={evento} value={evento}>
              {dettagliEvento[0]}
            </option>
          );
        })
      );

      this.setState({
        eventi: renderData,
        evento: eventiAttivi[0],
        biglietteria: dettagliEvento[4],
      });
      this.aggiornaBiglietti();
    } catch (err) {
      // TODO: bug da risolvere
      //renderNotification("danger", "Error", "Error while updating the events");
      console.log("Error while updating the events", err);
    }
  };

  aggiornaBiglietti = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();
      const nftInstance = await EventoNFT(this.state.evento);
      const biglietti = await nftInstance.methods
        .getBigliettiCliente(initiator)
        .call({ from: initiator });
      const renderData = biglietti.map((biglietto, i) => (
        <option key={biglietto} value={biglietto}>
          {biglietto}
        </option>
      ));

      this.setState({ biglietti: renderData, biglietto: biglietti[0] });
    } catch (e) {
      // TODO: bug da risolvere
      // renderNotification("danger","Error","Error in updating the biglietto for the event");
      console.log("Error in updating the biglietto", e);
      console.log(e);
    }
  };

  onFestivalChangeHandler = async (e) => {
    try {
      const state = this.state;
      state[e.target.name] = e.target.value;
      this.setState(state);

      const { evento } = this.state;
      await this.aggiornaBiglietti(evento);

      const initiator = await web3.eth.getCoinbase();
      const dettagliEvento = await creazioneEvento.methods
        .getDettagliEvento(evento)
        .call({ from: initiator });

      this.setState({ biglietteria: dettagliEvento[4] });
    } catch (err) {
      console.log("Error while bigliettos for the event", err.message);
      renderNotification(
        "danger",
        "Error",
        "Error while bigliettos for the event"
      );
    }
  };

  selectHandler = (e) => {
    this.setState({ biglietto: e.target.value });
  };

  inputChangedHandler = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  };

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
                  name="evento"
                  value={this.state.evento || undefined}
                  onChange={this.onEventChangeHandler}
                >
                  <option value="" disabled>
                    Seleziona l'evento
                  </option>
                  {this.state.eventi}
                </select>
                <br />
                <br />

                <label class="left">Biglietto</label>
                <select
                  className="browser-default"
                  name="biglietto"
                  value={this.state.biglietto || undefined}
                  onChange={this.selectHandler}
                >
                  <option value="" disabled>
                    Seleziona il biglietto
                  </option>
                  {this.state.biglietti}
                </select>
                <br />
                <br />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyTickets;
