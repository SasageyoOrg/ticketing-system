// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EventFactory is Ownable {
    
    struct Event {
        uint eventID            // id dell'evento
        string eventName;       // Nome Evento
        uint256 ticketPrice;    // Prezzo dei ticket dell'evento
        uint256 totalSupply;    // Numero di Ticket disponibili alla creazione
        uint256 eventDate;      // Data di inizio dell'evento
    }

    address[] private eventList;    // Lista address degli eventi
    mapping(address => Event) private eventListMapping;

    /* ===============================Functions=============================== */

    // Get lista degli address degli eventi
    function getEventList() public view returns (address[] memory) {
        return eventList;
    }

    // Get dettagli evento
    function getEventDetails(address eventAddress) public view returns (uint, string memory, uint256, uint256, uint256){
        return (
            eventListMapping[eventAddress].eventID
            eventListMapping[eventAddress].eventName,
            eventListMapping[eventAddress].ticketPrice,
            eventListMapping[eventAddress].totalSupply,
            eventListMapping[eventAddress].eventDate
        );
    }

    // Creazione nuovo evento
    event Created(address ntfAddress);
    function createNewEvent(string memory eventName, 
                            uint256 ticketPrice, 
                            uint256 totalSupply, 
                            uint256 eventDate) 
    public onlyOwner returns (address) {
        
        eventID = eventList.length + 1

        EventNFT newEvent = new EventNFT( 
            eventID,
            eventName,
            ticketPrice,
            totalSupply,
            eventDate,
            msg.sender
        );

        address newEventAddress = address(newEvent);
        eventList.push(newEventAddress);

        eventListMapping[newEventAddress] = Festival({
            eventID: eventID,
            eventName: eventName,
            ticketPrice: ticketPrice,
            totalSupply: totalSupply,
            eventDate: eventDate
        });

        emit Created(newEventAddress);

        return newEventAddress;
    }

}