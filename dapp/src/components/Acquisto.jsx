import React, { Component } from 'react';
import Web3 from 'web3';
import creazioneEvento from '../proxies/CreazioneEvento';
import EventoNFT from '../proxies/NFTEvento';
import Biglietteria from '../proxies/Biglietteria';
import renderNotification from '../utils/notification-handler';

let web3;

class Purchase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      eventi: [],
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
      const eventiAttivi = await creazioneEvento.methods.getEventiAttivi().call({ from: initiator });
      const eventi = await Promise.all(eventiAttivi.map(async evento => {
        const dettagliEvento = await creazioneEvento.methods.getDettagliEvento(evento).call({ from: initiator });
        //const [eventoName, simboloEvento, prezzoBiglietto, bigliettiDisponibili, biglietteria] = Object.values(dettagliEvento);
        const [nomeEvento, prezzoBiglietto, bigliettiDisponibili, biglietteria] = Object.values(dettagliEvento);
        const nftInstance = await EventoNFT(evento);
        const saleId = await nftInstance.methods.getNextSaleTicketId().call({ from: initiator });

        return (
          <tr key={evento}>
            <td class="center">{nomeEvento}</td>
            <td class="center">{web3.utils.fromWei(prezzoBiglietto, 'ether')}</td>
            <td class="center">{bigliettiDisponibili - saleId}</td>

            <td class="center">
            {(this.state.account.type === "cliente")
                ? <button type="submit" className="custom-btn login-btn" onClick={this.onPurchaseTicket.bind(this, biglietteria, prezzoBiglietto, initiator)}>
                    Acquista
                  </button>
                : <div></div>
              }
            </td>
          </tr>
        );
      }));

      this.setState({ eventi: eventi });
    } catch (err) {
      renderNotification('danger', 'Error', err.message);
      console.log('Error while updating the events', err);
    }
  }

  onPurchaseTicket = async (biglietteria, prezzoBiglietto, initiator) => {
    try {
      const biglietteriaInstance = await Biglietteria(biglietteria);
      //await eventoToken.methods.approve(biglietteria, prezzoBiglietto).send({ from: initiator, gas: 6700000 });
      //await biglietteriaInstance.methods.purchaseTicket().send({ from: initiator, gas: 6700000, value: prezzoBiglietto });
      await biglietteriaInstance.methods
        .purchaseTicket()
        .send({ 
          from: initiator, 
          value: prezzoBiglietto
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
              <th key='price' class="center">Prezzo (ETH)</th>
              <th key='left' class="center">Biglietti rimanenti</th>
              {(this.state.account.type === "cliente")
                ? <th key='purchase' class="center"></th>
                : <div></div>
              }
            </tr>
          </thead>
          <tbody class="striped highlight">
            {this.state.eventi}
          </tbody>
        </table>
      </div >
    )
  }
}

export default Purchase;  