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
        string state;
        address buyer; 
    }
    struct TicketToCheck {
        uint256 ticketID;
        address exposer; 
    }

    // counter dei tickets 
    Counters.Counter private _ticketIds;
    
    uint private _eventID;                                    // id dell'evento
    uint256 private _ticketPrice;                             // prezzo
    uint256 private _totalSupply;                             // biglietti rimanenti
    uint256 private _eventDate;                               // data del evento
    address private _organizer;                               // organizzatore
    // address[] private _soldTicketsList;                        // address biglietti acquistati
    
    mapping(uint256 => TicketDetails) private _ticketDetails; // dettagli dei biglietti

    mapping(address => uint256[]) public _purchasedTicketsMapping;  // biglietti acquistati
    uint256[] private _purchasedTicketsIds;

    // biglietti esibiti da verificare
    mapping(uint256 => address) public _ticketsToCheckAddresses;  // biglietti da verificare
    uint256[] private _ticketsToCheckIds;

    //TODO: da valutare se serve...
    //uint256[] private soldTickets;    //lista biglietti venduti
    address[] private _customers;      //clienti

    constructor(
        uint eventID,
        string memory eventName,    // nome dell'evento
        string memory eventSymbol,  // simbolo dell'evento
        uint256 ticketPrice,        // prezzo di un biglietto
        uint256 totalSupply,        // biglietti disponibili alla creazione
        uint256 eventDate,          // data del evento
        address organizer,            // indirizzo del rivenditore
        address reseller
    ) public ERC721(eventName, eventSymbol) {

      _setupRole(MINTER_ROLE, organizer);
      _setupRole(MINTER_ROLE, reseller);

      _eventID = eventID;
      _ticketPrice = ticketPrice;
      _totalSupply = totalSupply;
      _eventDate = eventDate;
      _organizer = organizer;
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
    function deployTicket(address reseller, address buyer) public virtual isMinterRole returns (bool) {
        _ticketIds.increment();
        uint256 newTicketId = _ticketIds.current();

        require(
          _ticketIds.current() <= _totalSupply,
          "Superato limite massimo dei Ticket!"
        );
        _mint(reseller, newTicketId);

    
        // definizioni per i ticket 
        // @state -> definisce lo stato attuale del ticket 
        //           - buyed: appena acquistato 
        //           - pending: check-in
        //           - accepted: biglietto verificato dal controllore
        //           - denied: biglietto regettato dal controllore
        _ticketDetails[newTicketId] = TicketDetails({
            state: "comprato",
            buyer: buyer
        });

        _purchasedTicketsMapping[buyer].push(newTicketId);

        // trasferisce la proprietà del ticket dal reseller al cliente
        transferFrom(ownerOf(newTicketId), buyer, newTicketId);

        // aggiungo cliente alla lista dei customers se non è già stato fatto
        /*if (!isCustomerExist(buyer)) {
            customers.push(buyer);
        }*/

        return true;
    }

    // Utility function to check if customer exists to avoid redundancy
    /*function isCustomerExist(address buyer) internal view returns (bool) {
        for (uint256 i = 0; i < customers.length; i++) {
            if (customers[i] == buyer) {
                return true;
            }
        }
        return false;
    }*/
    // Inserisce il biglietto nella list dei biglietti da obliterare
    function setTTC(address customer, uint256 ticketID) public {
        bool isBuyer = false;
        uint256[] memory customerTickets = getPurchasedTicketsOfCustomer(customer);
        

        require(_ticketIds.current() >= ticketID, 'Il biglietto non e stato ancora venduto');

        require(keccak256(bytes( _ticketDetails[ticketID].state)) == keccak256(bytes('comprato')), "Il bigliietto e' stato gia' esibito");
        
        for (uint256 i = 0; i < customerTickets.length; i++) {
            if (customerTickets[i] == ticketID) {
                isBuyer = true;
            }
        }
        require(isBuyer, 'Non hai acquistato questo biglietto');


        _ticketsToCheckAddresses[ticketID] = customer;
        _ticketsToCheckIds.push(ticketID);
        
        _ticketDetails[ticketID].state = 'rifiutato';  //il bilgietto inizialmente è rifiutato
    }

    // Customer shows ticket to the controller
    function checkTicket(uint256 ticketID) public returns (bool) { 

        address exposer = _ticketsToCheckAddresses[ticketID];

        require(_purchasedTicketsMapping[exposer].length != 0, "Il customer non ha acquistato biglietti.");

        bool isBuyer = false;

        for (uint256 i = 0; i < _purchasedTicketsMapping[exposer].length; i++) {
            if (_purchasedTicketsMapping[exposer][i] == ticketID) {
                isBuyer = true;
            }
        }

        require(isBuyer, "Il biglietto esibito e' stato acquistato da un altro cliente");

        _ticketDetails[ticketID].state = 'accettato';

        return isBuyer;
    }

    // GETTERS ==================================================================

    // TODO: funzioni utility da controllare!
    // Get ticket actual price

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

    function getTicketPrice() public view returns (uint256) {
        return _ticketPrice;
    }

    // Get ticket state from tickerID
    function getTicketState(uint256 ticketID) public view returns (string memory) {
        return _ticketDetails[ticketID].state;
    }

    function getPurchasedTicketsOfCustomer(address customer) public view returns (uint256[] memory) {
        return _purchasedTicketsMapping[customer];
    }

    function getRemainingTickets() public view returns (uint){
        return _totalSupply - _ticketIds.current();
    }
    
    function getTicketsToCheck() public view returns(uint256[] memory){
        return _ticketsToCheckIds;
    }

    function getTicketsToCheckExposer(uint256 ticketId) public view returns(address){
        return _ticketsToCheckAddresses[ticketId];
    }

    function getPurchasedTickets() public view returns(uint256[] memory){
        return _purchasedTicketsIds;
    }
    
}