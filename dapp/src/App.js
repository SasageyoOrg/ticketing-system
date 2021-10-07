import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch, Redirect} from 'react-router-dom';
import ReactNotification from 'react-notifications-component';
//import Web3 from 'web3';
import Festival from './components/Evento';
import Purchase from './components/Acquisto';
import MyTickets from './components/Biglietti';
import SecondaryMarket from './components/Rivendita';

import './App.css'

let web3

const Web3 = require("web3");
const Web3Quorum = require("web3js-quorum");

//const web3 = new Web3Quorum(new Web3("http://localhost:22000"));
//web3.priv.generateAndSendRawTransaction(options);

class App extends Component {
  state = {
    account: '',
    accountAddress: '0x',
    accountBalance: '0',
  }

  constructor() {
    super();
    //this.state = {account: ''};

    new Promise((resolve, reject) => {
      if (typeof window.ethereum !== 'undefined') {
        //web3 = new Web3(window.ethereum);
        web3 = new Web3Quorum(new Web3(window.ethereum));
        window.ethereum.enable()
          .then(() => {
            resolve(
              new Web3Quorum(new Web3(window.ethereum))
              //new Web3(window.ethereum)
            );
          })
          .catch(e => {
            reject(e);
          });
        return;
      }
      if (typeof window.web3 !== 'undefined') {
        return resolve(
          //new Web3(window.web3.currentProvider)
          new Web3Quorum(new Web3(window.web3.currentProvider))
        );
      }
      resolve(new Web3Quorum(new Web3('http://127.0.0.1:8545')))
      //resolve(new Web3('http://127.0.0.1:8545'));
    });

    this.loadBlockChain()

    window.ethereum.on('accountsChanged', function () {
      window.location.reload();
    });
  }

  async loadBlockChain() {
    //const web3 = new Web3(Web3.givenProvider || 'http://localhost:8080')
    //const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545')
    //const network = await web3.eth.net.getNetworkType();
    //console.log(network) // should give you main if you're connected to the main network via metamask...
    const accounts = await web3.eth.getAccounts()
    if (accounts[0] === "0xC9C913c8c3C1Cd416d80A0abF475db2062F161f6"){
      this.setState({account: "organizer"})
    }else{
      this.setState({account: "user"})
    }

    this.setState({accountAddress: accounts[0]})

    var balance = await web3.eth.getBalance(accounts[0]); 
    balance = web3.utils.fromWei(balance);
    this.setState({accountBalance: balance})
  }

  render() {
    let nav
    let path
    if (this.state.account == "organizer") {
      nav = (
        <div>
          <li> <Link to="/createFestival">Crea evento</Link> </li>
          <li> <Link to="/buyTickets">Market</Link> </li>
        </div>
      )
      path = "/createFestival"
    }else{
      nav = (
        <div>
          <li> <Link to="/buyTickets">Acquista biglietti</Link> </li>
          <li> <Link to="/market">Rivendita</Link> </li>
          <li> <Link to="/tickets">I miei biglietti</Link> </li>
          <li> <span class="user_addressbox">Account: <b>{this.state.accountAddress.substring(0,8)}...</b></span></li>
          <li> <span class="user_balancebox">Saldo: <b>{this.state.accountBalance} ETH</b></span></li>
        </div>
      )
      path = "/tickets"
    }
    return (
      <Router>
        <div>
          <ReactNotification />
          <nav style={{ padding: '0px 30px 0px 30px' }}>
            <div class="nav-wrapper" >
              <a href="/" class="brand-logo left">Biglietteria Online</a>
              <ul class="right hide-on-med-and-down 10" >
                {nav}
              </ul>
            </div>
          </nav>
          <Switch>
            <Route path="/createFestival" component={Festival} />
            
            <Route path='/buyTickets' render={
                (props) => <Purchase {...props} acc={this.state.account}/>
              } 
            />
            <Route path="/market" component={SecondaryMarket} />
            <Route path="/tickets" component={MyTickets} />
          </Switch>
          <Redirect to={path} />
        </div>
      </Router >
    )
  }
}

export default App;
