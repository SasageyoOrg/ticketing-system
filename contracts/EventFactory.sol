// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Event.sol";

contract EventFactory is Ownable, AccessControl {
    
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    address _reseller;
    constructor(address organizer, address reseller) public {
        _setupRole(ORGANIZER_ROLE, organizer);
        _setupRole(MINTER_ROLE, reseller);
        _reseller = reseller;
    }

    struct EventStruct {
        uint eventID;            // id dell'evento
        string eventName;       // Nome Evento
        string eventSymbol;
        uint256 ticketPrice;    // Prezzo dei ticket dell'evento
        uint256 totalSupply;    // Numero di Ticket disponibili alla creazione
        uint256 eventDate;      // Data di inizio dell'evento
    }

    address[] private eventList;    // Lista address degli eventi
    mapping(address => EventStruct) private eventListMapping;

    /* ===============================Functions=============================== */

    // Get lista degli address degli eventi
    function getEventList() public view returns (address[] memory) {
        return eventList;
    }

    // Get dettagli evento
    function getEventDetails(address eventAddress) public view returns (uint, string memory, string memory, uint256, uint256, uint256){
        return (
            eventListMapping[eventAddress].eventID,
            eventListMapping[eventAddress].eventName,
            eventListMapping[eventAddress].eventSymbol,
            eventListMapping[eventAddress].ticketPrice,
            eventListMapping[eventAddress].totalSupply,
            eventListMapping[eventAddress].eventDate
        );
    }

    // Creazione nuovo evento
    event Created(address eventAddress);

    function createNewEvent(string memory eventName, 
                            string memory eventSymbol,
                            uint256 ticketPrice, 
                            uint256 totalSupply, 
                            uint256 eventDate) public onlyOwner returns (address) {

        // Controllo se l'operatore e' un organizzatore
        require(hasRole(ORGANIZER_ROLE, msg.sender), "Caller is not allowed");

        uint eventID = eventList.length + 1;

        Event newEvent = new Event( 
            eventID,
            eventName,
            eventSymbol,
            ticketPrice,
            totalSupply,
            eventDate,
            msg.sender,
            _reseller
        );

        address newEventAddress = address(newEvent);
        eventList.push(newEventAddress);

        eventListMapping[newEventAddress] = EventStruct({
            eventID: eventID,
            eventName: eventName,
            eventSymbol: eventSymbol,
            ticketPrice: ticketPrice,
            totalSupply: totalSupply,
            eventDate: eventDate
        });

        emit Created(newEventAddress);

        return newEventAddress;
    }

}