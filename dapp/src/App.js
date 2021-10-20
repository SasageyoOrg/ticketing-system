import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch, Redirect} from "react-router-dom";
import ReactNotification from "react-notifications-component";
import Web3 from 'web3';
import Festival from "./components/Evento";
import Purchase from "./components/Acquisto";
import MyTickets from "./components/Biglietti";
import Guest from "./components/Visitatore";
import Controller from "./components/Controllore";
// import renderNotification from './utils/notification-handler';
// stili
import "./App.css";

// web3
let web3;

// const Web3 = require("web3");
// const Web3Quorum = require("web3js-quorum");

class App extends Component {
  state = {
    account: {
      type: "",  
      address: "0xXXXXXXXX",   
      balance: "000", 
    },
  };

  constructor() {
    super();

    new Promise((resolve, reject) => {
      if (typeof window.ethereum !== "undefined") {
        web3 = new Web3(window.ethereum);
        //web3 = new Web3Quorum(new Web3(window.ethereum));
        window.ethereum.enable()
          .then(() => {
            resolve(
              // new Web3Quorum(new Web3(window.ethereum))
              new Web3(window.ethereum)
            );
          })
          .catch((e) => { reject(e) });
        return;
      }
      if (typeof window.web3 !== "undefined") {
        return resolve(
          new Web3(window.web3.currentProvider)
          //new Web3Quorum(new Web3(window.web3.currentProvider))
        );
      }
      //resolve(new Web3Quorum(new Web3("http://127.0.0.1:8545")));
      resolve(new Web3('http://127.0.0.1:8545'));
    });

    // check if there's web3 and window.ethereum
    if(window.ethereum !== undefined && web3 !== undefined) {
      // funzione async di gestione della blockchain
      this.loadBlockChain();

      // refresh della pagina al cambio account (tramite Metamask)
      window.ethereum.on("accountsChanged", function () {
        window.location.reload();
      });
    }

  }

  async loadBlockChain() {
    // recupero account collegati
    const accounts = await web3.eth.getAccounts();

    // switching sull'account attivo per verificare i privilegi
    switch (accounts[0]) {
      case "0xC9C913c8c3C1Cd416d80A0abF475db2062F161f6":
        this.setState((prevState) => ({
          account: {...prevState.account, type: "organizzatore"},
        }));
        break;
      case "0x4d929E07c173ceA67f8008bb19A151e0564e1362":
        this.setState((prevState) => ({
          account: {...prevState.account, type: "rivenditore"},
        }));
        break;
      case "0x81559247E62fDb78A43e9535f064ED62B11B6830":
        this.setState((prevState) => ({
          account: {...prevState.account, type: "controllore"},
        }));
        break;
      case "0xB4dc6aE681Fa6D5433e68D76aC9318b734F49001":
        this.setState((prevState) => ({
          account: {...prevState.account, type: "cliente"},
        }));
        break;
      default:
        this.setState((prevState) => ({
          account: {...prevState.account, type: "visitatore"},
        }));
        break;
    }

    // valorizza 'this.state.account.address'
    this.setState((prevState) => ({
      account: { ...prevState.account, address: accounts[0]}
    }));

    // valorizza 'this.state.account.balance'
    try {
      var balance = await web3.eth.getBalance(accounts[0]);
      this.setState((prevState) => ({
        account: {...prevState.account, balance: web3.utils.fromWei(balance)}
      }));
    } catch(err) {
      //renderNotification('danger', 'Errore', 'Ops, qualcosa è andato storto. Controlla lo stato della rete.');
      console.log("Failed with error: " + err);
      console.log(err.message);
    }
  }

  render() {
    let nav;
    let path;
    if (this.state.account.type === "organizzatore") {
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
            <span class="user_addressbox">
              Account: <b>{this.state.account.address.substring(0, 8)}...</b>
            </span>
          </li>
          <li>
            {" "}
            <span class="user_balancebox">
              Saldo: <b>{this.state.account.balance} ETH</b>
            </span>
          </li>
        </div>
      );
      path = "/createFestival";
    } else if(this.state.account.type === "controllore") {
      nav = (
        <div>Controlla Biglietti</div>
      );
      path='/controller'
    } else if(this.state.account.type === "cliente") {
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
            <span class="user_addressbox">
              Account: <b>{this.state.account.address.substring(0, 8)}...</b>
            </span>
          </li>
          <li>
            {" "}
            <span class="user_balancebox">
              Saldo: <b>{this.state.account.balance} ETH</b>
            </span>
          </li>
        </div>
      );
      path = "/tickets";
    } else {
      nav = (
        <div>
          <li>
            <span class="user_addressbox">Visitatore</span>
          </li>
        </div>
      );
      path = "/guest";
    }
    return (
      <Router>
        <div>
          <ReactNotification />
          <nav style={{ padding: "0px 30px 0px 30px" }}>
            <div class="nav-wrapper">
              <a href="/" class="brand-logo left">
                Biglietteria Online
              </a>
              <ul class="right hide-on-med-and-down 10">{nav}</ul>
            </div>
          </nav>
          <Switch>
            <Route path="/createFestival" component={Festival} />
            <Route path="/guest" component={Guest} />
            <Route
              path="/market"
              render={(props) => (
                <Purchase {...props} acc={this.state.account} />
              )}
            />
            <Route path="/tickets" component={MyTickets} />
            <Route path="/controller" component={Controller} />
          </Switch>
          <Redirect to={path} />
        </div>
      </Router>
    );
  }
}

export default App;
