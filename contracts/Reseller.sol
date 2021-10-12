// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Event.sol";
import "./EventFactory.sol";

contract Reseller {
    EventFactory private _eventFactory;     // todo
    address private _organiser;             // organiser address (account)
    address private _reseller;              // ticket office address

    constructor(EventFactory eventFactory) public {
        _eventFactory = eventFactory;
         
        // set the address of the ticket office's smart contract 
        // in ordeer to get commissions after a sale
        _reseller = address(this);  
    }

    /*
     * Purchase tickets from the ticket office directly
     * @ticketID -> ID ticket da acquistare
     */
    function purchaseTicket(address evento) public payable {
        address buyer = msg.sender;                         // buyer account
        uint256 salePrice = msg.value;                      // sale price 

        // calc the commissions (10%)
        uint256 commissions = (salePrice * 10) / 100;
        uint256 finalPrice = salePrice - commissions;

        // send ETH from buyer to the organiser
        //(bool sent_org, bytes memory data_org) = payable(_organiser).call{value: finalPrice}("");
        (bool sent_org, ) = payable(_organiser).call{value: finalPrice}("");
        require(sent_org, "Failed to send Ether to the organiser");

        // TO-DO: send ETH from buyer to the ticket office
        (bool sent_to, ) = payable(_reseller).call{value: commissions}("");
        require(sent_to, "Failed to send Ether to the ticket office.");
        
        // transfer ticket to the new owner (= buyer)
        bool ticketTransfered = Event(evento).deployTicket(_reseller, buyer);
        require(ticketTransfered, "Failed to deploy ticket");
    }

    /*
     * Customer shows ticket to the controller
     */
    function checkIN(Event eventID, uint256 ticketID) public {
        
    }

}