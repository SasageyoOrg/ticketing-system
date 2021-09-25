import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch, Redirect} from 'react-router-dom';
import ReactNotification from 'react-notifications-component';
import Web3 from 'web3';
import Festival from './components/Festival';
import Purchase from './components/Purchase';
import MyTickets from './components/MyTickets';
import SecondaryMarket from './components/SecondaryMarket';

let web3

class App extends Component {
  state = {account: ''}

  constructor() {
    super();
    //this.state = {account: ''};

    new Promise((resolve, reject) => {
      if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        window.ethereum.enable()
          .then(() => {
            resolve(
              new Web3(window.ethereum)
            );
          })
          .catch(e => {
            reject(e);
          });
        return;
      }
      if (typeof window.web3 !== 'undefined') {
        return resolve(
          new Web3(window.web3.currentProvider)
        );
      }
      resolve(new Web3('http://127.0.0.1:8545'));
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
    if (accounts[0] == "0x43CdA9c0610049499A189D573F23CCb2928E79b4"){
      this.setState({account: "organizer"})
    }else{
      this.setState({account: "user"})
    }
  }

  render() {
    let nav
    let path
    if (this.state.account == "organizer") {
      nav = (
        <div>
          <li> <Link to="/createFestival">Add Festival</Link> </li>
          <li> <Link to="/buyTickets">Market</Link> </li>
        </div>
      )
      path = "/createFestival"
    }else{
      nav = (
        <div>
          <li> <Link to="/buyTickets">Buy Tickets</Link> </li>
          <li> <Link to="/market">Your Market</Link> </li>
          <li> <Link to="/tickets">MyTickets</Link> </li>
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
              <a href="/buyTickets" class="brand-logo left">Festival Marketplace</a>
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
