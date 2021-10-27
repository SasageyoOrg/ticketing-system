// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Event.sol";

contract Reseller {
    address private _organizer;             // indirizzo organiser
    address private _reseller;              // indirizzo ticket office

    constructor(address organizer) public {
        _organizer = organizer;
        _reseller = address(this);  
    }

    /* ===============================Functions=============================== */

    /*
     * Acquisto Biglietto (ticket) 
     * @ticketID -> ID ticket da acquistare
     */
    function purchaseTicket(address evento) external payable {
        address buyer = msg.sender;    // account dell'acquirente
        uint256 sentValue = msg.value; // valore del biglietto selezionato
        
        // controllo se i bilgietti sono finiti
        uint eventSupply = Event(evento).getRemainingTickets();
        require(eventSupply >= 1, "Biglietti finiti");
        
        // Calcolo della commisione dell'acquisto:
        // 10% al reseller
        // 90% al organizaatore
        uint256 commissions = (sentValue * 10) / 100;
        uint256 finalPrice = sentValue - commissions;

        payable(_organizer).transfer(finalPrice);

        // trnasferimento del ticket all'acquirente
        bool ticketTransfered = Event(evento).deployTicket(_reseller, buyer);
        require(ticketTransfered, "Deploy ticket fallito.");
    }

    // Cliente mostra i ticket al controllore per esibirli
    function checkIN(address eventAddr, address customer, uint256 ticketID) public returns (bool) { 
        Event(eventAddr).setTTC(customer, ticketID);
        return true;
    } 

}