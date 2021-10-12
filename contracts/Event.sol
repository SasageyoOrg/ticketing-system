// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Event is Context, AccessControl, ERC721 {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct TicketDetails {
        string memory state;
    }

    // counter dei tickets 
    Counters.Counter private _ticketIds;
    
    uint private _eventID                                     // id dell'evento
    uint256 private _ticketPrice;                             // prezzo
    uint256 private _totalSupply;                             // biglietti rimanenti
    uint256 private _eventDate;                               // data del evento
    address private _organizer;                               // organizzatore
    address[] private _soldTicketsList                        // address biglietti acquistati
    
    mapping(uint256 => TicketDetails) private _ticketDetails; // dettagli dei biglietti
    mapping(address => uint256[]) private _purchasedTickets;  // biglietti acquistati

    //TODO: da valutare se serve...
    //uint256[] private soldTickets;    //lista biglietti venduti
    address[] private _customers;      //clienti

    constructor(
        uint eventID
        string memory eventName,    // nome dell'evento
        string memory eventSymbol,  // simbolo dell'evento
        uint256 ticketPrice,        // prezzo di un biglietto
        uint256 totalSupply,        // biglietti disponibili alla creazione
        uint256 eventDate,          // data del evento
        address reseller            // indirizzo del rivenditore
    ) public ERC721(eventName, eventSymbol) {

      _setupRole(MINTER_ROLE, reseller);

      _eventID = eventID
      _ticketPrice = ticketPrice
      _totalSupply = totalSupply
      _eventDate = eventDate
      _organizer = organizer
    }

    modifier isValidTicketCount {
      require(
          _ticketIds.current() < _totalSupply,
          "Superato limite massimo dei Ticket!"
      );
      _;
    }

    modifier isMinterRole {
      require(
          hasRole(MINTER_ROLE, _msgSender()),
          "L'utente deve avere il ruolo di minter per poter minare!"
      );
      _;
    }

    /*
     * Mint new tickets and assign it to reseller
     * Access controlled by minter only
     * Returns new ticketId
     */
    function deployTicket(address reseller, address buyer) internal virtual isMinterRole returns (bool) {
        _ticketIds.increment();
        uint256 newTicketId = _ticketIds.current();
        _mint(reseller, newTicketId);

        // definizioni per i ticket 
        // @state -> definisce lo stato attuale del ticket 
        //           - buyed: appena acquistato 
        //           - pending: check-in
        //           - accepted: biglietto verificato dal controllore
        //           - denied: biglietto regettato dal controllore
        _ticketDetails[newTicketId] = TicketDetails({
            state: "buyed"
        });
        
        // trasferisce la proprietà del ticket dal reseller al cliente
        transferFrom(ownerOf(newTicketId), buyer, newTicketId);

        return true;
    }

    // TODO: funzioni utility da controllare!
    // // Get ticket actual price
    // function getTicketPrice() public view returns (uint256) {
    //     return _ticketPrice;
    // }

    // // Get current ticketId
    // function ticketCounts() public view returns (uint256) {
    //     return _ticketIds.current();
    // }

    // // Get selling price for the ticket
    // function getSellingPrice(uint256 ticketId) public view returns (uint256) {
    //     return _ticketDetails[ticketId].sellingPrice;
    // }

    // // Get all tickets available for sale
    // function getTicketsForSale() public view returns (uint256[] memory) {
    //     return ticketsForSale;
    // }

    // Get ticket details from tickerID
    function getTicketState(uint256 ticketID) public view returns (string memory) {
        return _ticketDetails[ticketID].state;
    }
  
     // Get all tickets owned by a customer
    function getTicketsOfCustomer(address customer) public view returns (uint256[] memory) {
        return purchasedTickets[customer];
    }



















/*     function getEventDetails() public view returns (
      uint eventID
      string memory eventName,
      uint256 ticketPrice,
      uint256 totalSupply,
      uint256 eventDate
    ) {
      return(
        _eventID = eventID
        _eventName = eventName
        _ticketPrice = ticketPrice
        _totalSupply = totalSupply
        _eventDate = eventDate
        _organizer = organizer
      )
    } */

}