// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Event.sol";

contract Reseller {
    address private _organizer;             // organiser address (account)
    address private _reseller;              // ticket office address

    //mapping(address => uint) public _balance;
    //event Received(address, uint);

    //constructor(EventFactory eventFactory) public {
    constructor(address organizer) public {
         
        // set the address of the ticket office's smart contract 
        // in ordeer to get commissions after a sale
        _organizer = organizer;
        _reseller = address(this);  
    }

    /*
     * Purchase tickets from the ticket office directly
     * @ticketID -> ID ticket da acquistare
     */
    function purchaseTicket(address evento) external payable {
        address buyer = msg.sender;                         // buyer account
        uint256 sentValue = msg.value;
        // uint256 ticketPrice = Event(evento).getTicketPrice();
        // require(sentValue == );

        // calc the commissions (10%)
        uint256 commissions = (sentValue * 10) / 100;
        uint256 finalPrice = sentValue - commissions;

        // send ETH from buyer to the organiser
        //(bool sent_org, bytes memory data_org) = payable(_organiser).call{value: finalPrice}("");
        //(bool sent_org, ) = payable(_organizer).call{value: finalPrice}("");
        //require(sent_org, "Invio ETH all'Organizzatore fallito.");

        // TO-DO: send ETH from buyer to the ticket office
        // require(sent_to, "Invio ETH alla Biglietteria fallito.");
        //_balance[_reseller] += commissions;
        //address(this).balance += commissions;
        // emit Received(msg.sender, commissions);
        payable(_organizer).transfer(finalPrice);

        // transfer ticket to the new owner (= buyer)
        bool ticketTransfered = Event(evento).deployTicket(_reseller, buyer);
        require(ticketTransfered, "Deploy ticket fallito.");
    }

    // Customer shows ticket to the controller
    function checkIN(address eventAddr, address customer, uint256 ticketID) public returns (bool) { 
        Event(eventAddr).setTTC(customer, ticketID);
        return true;
    } 


    // function getTicketsOfCustomer(address customer, address[] memory eventList) public returns (uint256[] memory){
    //     uint256[] storage tickets;

    //     for (uint i_evnt = 0; i_evnt < eventList.length; i_evnt++) {
    //         for (uint i_tck = 0; i_tck < eventList.length; i_tck++) {
    //             tickets.push(Event(eventList[i_evnt]).getPurchasedTicketsOfCustomer(customer)[i_tck]);
    //         }  
    //     }

        /*for (uint index = 0; index < eventList.length; index++) {
            
            tickets.push(Event(eventList[index]).getPurchasedTicketsOfCustomer(customer));

        }*/
        
        // return tickets;

        // return Event(eventList[0]).getPurchasedTicketsOfCustomer(customer);

}