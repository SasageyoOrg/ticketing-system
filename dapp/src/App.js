import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,
} from "react-router-dom";
import ReactNotification from "react-notifications-component";
import renderNotification from "./utils/notification-handler";
import "./App.css";

// Componenti
import Festival from "./components/Evento";
import Purchase from "./components/Acquisto";
import MyTickets from "./components/Biglietti";
import Guest from "./components/Visitatore";
import Controllore from "./components/Controllore";

import Reseller from "./proxies/Reseller";

import Web3 from "web3";
let web3;

class App extends Component {
  state = {
    account: {
      type: "",
      address: "0xXXXXXXXX",
      balance: "000",
    },
    contractBalance: 0,
  };

  constructor() {
    super();
    this.loadBlockChain = this.loadBlockChain.bind(this);

    /* -------------------------- Blockchain connection ------------------------- */
    new Promise((resolve, reject) => {
      if (typeof window.ethereum !== "undefined") {
        web3 = new Web3(window.ethereum);
        //web3 = new Web3Quorum(new Web3(window.ethereum));
        window.ethereum
          .enable()
          .then(() => {
            resolve(
              // new Web3Quorum(new Web3(window.ethereum))
              new Web3(window.ethereum)
            );
          })
          .catch((e) => {
            reject(e);
          });
        return;
      }
      if (typeof window.web3 !== "undefined") {
        return resolve(
          new Web3(window.web3.currentProvider)
          //new Web3Quorum(new Web3(window.web3.currentProvider))
        );
      }
      //resolve(new Web3Quorum(new Web3("http://127.0.0.1:8545")));
      resolve(new Web3("http://127.0.0.1:8545"));

      // this.loadBlockChain = this.loadBlockChain.bind(this);
    });

    // check if there's web3 and window.ethereum
    if (window.ethereum !== undefined && web3 !== undefined) {
      // funzione async di gestione della blockchain
      this.loadBlockChain();

      // refresh della pagina al cambio account (tramite Metamask)
      window.ethereum.on("accountsChanged", function () {
        window.location.reload();
      });
    }
  }

  /* ------------------------- Blockchain data loading ------------------------ */
  async loadBlockChain() {
    // recupero account collegati
    const accounts = await web3.eth.getAccounts();
    //dati account attuale
    this.setAccountType(accounts);

    //balance del rivenditore
    this.setContractBalance();
  }

  setAccountType(accountsList) {
    // switching sull'account attivo per verificare i privilegi
    switch (accountsList[0]) {
      case "0xed9d02e382b34818e88B88a309c7fe71E65f419d":
        this.setState((prevState) => ({
          account: { ...prevState.account, type: "organizzatore" },
        }));
        break;
      case "0x4d929E07c173ceA67f8008bb19A151e0564e1362":
        this.setState((prevState) => ({
          account: { ...prevState.account, type: "rivenditore" },
        }));
        break;
      case "0x81559247E62fDb78A43e9535f064ED62B11B6830":
        this.setState((prevState) => ({
          account: { ...prevState.account, type: "controllore" },
        }));
        break;
      case "0xB4dc6aE681Fa6D5433e68D76aC9318b734F49001":
        this.setState((prevState) => ({
          account: { ...prevState.account, type: "cliente" },
        }));
        break;
      default:
        this.setState((prevState) => ({
          account: { ...prevState.account, type: "visitatore" },
        }));
        break;
    }
    // valorizza 'this.state.account.address'
    this.setState((prevState) => ({
      account: { ...prevState.account, address: accountsList[0] },
    }));

    this.setAccountBalance(accountsList);
  }

  async setAccountBalance(accountsList) {
    // valorizza 'this.state.account.balance'
    try {
      var balance = await web3.eth.getBalance(accountsList[0]);
      this.setState((prevState) => ({
        account: { ...prevState.account, balance: web3.utils.fromWei(balance) },
      }));
    } catch (err) {
      renderNotification(
        "danger",
        "Errore",
        "Qualcosa è andato storto nel caricare il saldo del portafoglio."
      );
      console.log(err.message);
    }
  }

  async setContractBalance() {
    try {
      var contractBalance = await web3.eth.getBalance(Reseller._address);
      contractBalance = web3.utils.fromWei(contractBalance);
      this.setState({ contractBalance });
    } catch (err) {
      renderNotification(
        "danger",
        "Errore",
        "Qualcosa è andato storto nel caricare il saldo della biglietteria."
      );
      console.log(err.message);
    }
  }

  /* ---------------------- Nav rander and path setting --------------------- */
  render() {
    let nav;
    let path = "/";

    switch (this.state.account.type) {
      /* -------------------------------------------------------------------------- */
      case "organizzatore":
        nav = (
          <div>
            <li>
              {" "}
              <Link to="/createFestival">Crea evento</Link>{" "}
            </li>
            <li>
              {" "}
              <Link to="/market">Market</Link>{" "}
            </li>
            <li>
              {" "}
              <span className="user_addressbox">
                Account: <b>{this.state.account.address.substring(0, 8)}...</b>
              </span>
            </li>
            <li>
              {" "}
              <span className="user_balancebox">
                Saldo: <b>{this.state.account.balance} ETH</b>
              </span>
            </li>
          </div>
        );
        path = "/createFestival";
        break;

      /* -------------------------------------------------------------------------- */
      case "controllore":
        nav = (
          <div>
            <li>
              {" "}
              <span className="user_addressbox">
                Account: <b>{this.state.account.address.substring(0, 8)}...</b>
              </span>
            </li>
          </div>
        );
        path = "/checkTickets";
        break;

      /* -------------------------------------------------------------------------- */
      case "cliente":
        nav = (
          <div>
            <li>
              {" "}
              <Link to="/market">Acquista biglietti</Link>{" "}
            </li>
            <li>
              {" "}
              <Link to="/tickets">I miei biglietti</Link>{" "}
            </li>
            <li>
              {" "}
              <span className="user_addressbox">
                Account: <b>{this.state.account.address.substring(0, 8)}...</b>
              </span>
            </li>
            <li>
              {" "}
              <span className="user_balancebox">
                Saldo: <b>{this.state.account.balance.substring(0, 5)} ETH</b>
              </span>
            </li>
          </div>
        );
        path = "/tickets";
        break;
      /* -------------------------------------------------------------------------- */
      default:
        nav = (
          <div>
            <li>
              <span className="user_addressbox">Visitatore</span>
            </li>
          </div>
        );
        // path = "/guest";
        break;
    }

    /* ---------------------------- Components render --------------------------- */
    return (
      <Router>
        <div>
          <ReactNotification />

          <nav className="nav-page" style={{ padding: "0px 30px 0px 30px" }}>
            <div className="nav-wrapper">
              <span href="#" className="reseller_balancebox">
                Biglietteria: <b>{this.state.contractBalance} ETH</b>
              </span>
              <ul className="right hide-on-med-and-down 10">{nav}</ul>
            </div>
          </nav>

          <Switch>
            <Route path="/createFestival" component={Festival} />
            <Route path="/guest" component={Guest} />
            <Route
              path="/market"
              render={(props) => (
                <Purchase
                  {...props}
                  acc={this.state.account}
                  loadBlockChain={this.loadBlockChain}
                />
              )}
            />
            <Route path="/tickets" component={MyTickets} />
            <Route path="/checkTickets" component={Controllore} />
          </Switch>

          <Redirect to={path} />
        </div>
      </Router>
    );
  }
}

export default App;