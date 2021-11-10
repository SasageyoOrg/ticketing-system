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
    
    mapping(uint256 => TicketDetails) private _ticketDetails; // dettagli dei biglietti

    mapping(address => uint256[]) public _purchasedTicketsMapping;  // biglietti acquistati
    uint256[] private _purchasedTicketsIds;

    // biglietti esibiti da verificare
    mapping(uint256 => address) public _ticketsToCheckAddresses;  // biglietti da verificare
    uint256[] private _ticketsToCheckIds;


    constructor(
        uint eventID,
        string memory eventName,    // nome dell'evento
        string memory eventSymbol,  // simbolo dell'evento
        uint256 ticketPrice,        // prezzo di un biglietto
        uint256 totalSupply,        // biglietti disponibili alla creazione
        uint256 eventDate,          // data del evento
        address organizer,          // indirizzo dell'organizzatore
        address reseller            // indirizzo del rivenditore
    ) public ERC721(eventName, eventSymbol) {

      _setupRole(MINTER_ROLE, organizer);
      _setupRole(MINTER_ROLE, reseller);

      _eventID = eventID;
      _ticketPrice = ticketPrice;
      _totalSupply = totalSupply;
      _eventDate = eventDate;
      _organizer = organizer;
    }
    
    /* ===============================Functions=============================== */

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
     * Minta nuovi biglietti
     * Accesso riservato solo agli account con ruolo di minter
     * Restituisce l'Id del ticket appena creato
     */
    function deployTicket(address reseller, address buyer) public virtual isMinterRole returns (bool) {
        require(
            hasRole(MINTER_ROLE, reseller),
            "L'utente deve avere il ruolo di minter per poter minare!"
        );

        _ticketIds.increment();
        uint256 newTicketId = _ticketIds.current();

        require(
          _ticketIds.current() <= _totalSupply,
          "Superato limite massimo dei Ticket!"
        );
        _mint(reseller, newTicketId);

    
        // definizioni per i ticket 
        // @state -> definisce lo stato attuale del ticket 
        //           - comprato: appena acquistato 
        //           - esibito: check-in
        //           - accettato: biglietto verificato dal controllore
        _ticketDetails[newTicketId] = TicketDetails({
            state: "comprato",
            buyer: buyer
        });

        _purchasedTicketsMapping[buyer].push(newTicketId);

        // trasferisce la proprietà del ticket dal reseller al cliente
        transferFrom(ownerOf(newTicketId), buyer, newTicketId);

        return true;
    }

    /*  
        * Inserisce il biglietto nella list dei biglietti da obliterare
        * Vengono effettuati una serie di controlli:
            - Se il bigliett e' stato acquistato
            - Se e' gia' stato esibito
            - Se chi esibisce il biglietto e' il compratore
    */
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
        
        // il bilgietto verrà settato in esibito nel momento in cui setTTC 
        // termina superando tutti i require
        _ticketDetails[ticketID].state = 'esibito';  
    }

    /* 
        * Il controllore verifica il biglietto esibito
        * Il biglietto viene rifiutato se:
            - Chi esibisce il biglietto non ha biglietti associati al suo indirizzo
            - Il biglietto esibito e' stato acquistato da un altro address
     */
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

    // UTILITY ==================================================================

    // Get prezzo del ticket
    function getTicketPrice() public view returns (uint256) {
        return _ticketPrice;
    }

    // Get ticket state from tickerID
    function getTicketState(uint256 ticketID) public view returns (string memory) {
        return _ticketDetails[ticketID].state;
    }

    // Get ticket comprati di un cliente
    function getPurchasedTicketsOfCustomer(address customer) public view returns (uint256[] memory) {
        return _purchasedTicketsMapping[customer];
    }

    // Get numero di ticket rimanenti
    function getRemainingTickets() public view returns (uint){
        return _totalSupply - _ticketIds.current();
    }
    
    // Get numero di ticket da esibire 
    function getTicketsToCheck() public view returns(uint256[] memory){
        return _ticketsToCheckIds;
    }

    // Get indirizzo dell'exposer di un ticket
    function getTicketsToCheckExposer(uint256 ticketId) public view returns(address){
        return _ticketsToCheckAddresses[ticketId];
    }

    // Get lista di ticket ID  comprati
    function getPurchasedTickets() public view returns(uint256[] memory){
        return _purchasedTicketsIds;
    }
    
}