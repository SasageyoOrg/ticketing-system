import React, { Component } from 'react';
import Web3 from 'web3';
import renderNotification from '../utils/notification-handler';

let web3;

class Guest extends Component {
  constructor() {
    super();

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {

    }

  render() {
    return (
      <div class="container center guest-message">
        <span>Per acquistare biglietti occorre accedere con il wallet Metamask.</span>
      </div >
    )
  }
}

export default Guest;  