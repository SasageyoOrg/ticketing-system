// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EventoNFT is Context, AccessControl, ERC721 {
    using Counters for Counters.Counter;

    // _idBiglietti -> id biglietto creato dall'organizzatore e messo in vendita
    // _saleTicketId -> id biglietto quando viene rimesso in vendita da utente nel secondary market
    Counters.Counter private _idBiglietti;
    Counters.Counter private _saleTicketId;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct TicketDetails {
        uint256 prezzoAcquisto;  // prezzo di vendita quando creato
        uint256 prezzoRivendita;   // prezzo di rivendita (secondary biglietteria)
        bool forSale;           // si capisce dai 
    }

    address private _organizzatore;
    address[] private clienti;
    uint256[] private bigliettiInVendita;
    uint256 private _prezzoBiglietto;
    uint256 private _bigliettiDisponibili;

    mapping(uint256 => TicketDetails) private _dettagliBiglietto;
    mapping(address => uint256[]) private bigliettiAcquistati;

    constructor(
        string memory nomeEvento,
        // string memory FestSymbol,
        uint256 prezzoBiglietto,
        uint256 bigliettiDisponibili,
        address organizzatore
    ) public ERC721(nomeEvento, "EV") {
        _setupRole(MINTER_ROLE, organizzatore);

        _prezzoBiglietto = prezzoBiglietto;
        _bigliettiDisponibili = bigliettiDisponibili;
        _organizzatore = organizzatore;
    }

    modifier isValidTicketCount {
        require(
            _idBiglietti.current() < _bigliettiDisponibili,
            "Maximum ticket limit exceeded!"
        );
        _;
    }

    modifier isMinterRole {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            "User must have minter role to mint"
        );
        _;
    }

    // to-do: c'è bisogno??!??!
    modifier isValidSellAmount(uint256 idBiglietto) {
        uint256 prezzoAcquisto = _dettagliBiglietto[idBiglietto].prezzoAcquisto;
        uint256 prezzoRivendita = _dettagliBiglietto[idBiglietto].prezzoRivendita;

        require(
            prezzoAcquisto + ((prezzoAcquisto * 110) / 100) > prezzoRivendita,
            "Re-selling price is more than 110%"
        );
        _;
    }

    /*
     * Mint new biglietti and assign it to operator
     * Access controlled by minter only
     * Returns new idBiglietto
     */
    function mint(address operator)
        internal
        virtual
        isMinterRole
        returns (uint256)
    {
        _idBiglietti.increment();
        uint256 idNuovoBiglietto = _idBiglietti.current();
        _mint(operator, idNuovoBiglietto);

        _dettagliBiglietto[idNuovoBiglietto] = TicketDetails({
            prezzoAcquisto: _prezzoBiglietto,
            prezzoRivendita: 0,
            forSale: false
        });

        return idNuovoBiglietto;
    }

    /*
     * Bulk mint specified number of biglietti to assign it to a operator
     * Modifier to check the ticket count is less than total supply
     */
    function bulkMintTickets(uint256 numOfTickets, address operator)
        public
        virtual
        isValidTicketCount
    {
        require(
            (countBiglietti() + numOfTickets) <= 1000,
            "Number of biglietti exceeds maximum ticket count"
        );

        for (uint256 i = 0; i < numOfTickets; i++) {
            mint(operator);
        }
    }

    /*
     * Primary purchase for the biglietti
     * Adds new cliente if not exists
     * Adds acquirente to biglietti mapping
     * Update ticket details
     */
    function trasferisciBiglietto(address acquirente) public returns (bool){
        // to-do: da controllare perchè 2 ID?! -> quando comprato e quando venduto
        _saleTicketId.increment();
        uint256 saleTicketId = _saleTicketId.current();

        // può darsi che se metto in vendita nel secondary non posso riacquistarlo 
        require(
            msg.sender == ownerOf(saleTicketId),
            "Only initial purchase allowed"
        );

        transferFrom(ownerOf(saleTicketId), acquirente, saleTicketId);

        if (!clienteEsistente(acquirente)) {
            clienti.push(acquirente);
        }
        bigliettiAcquistati[acquirente].push(saleTicketId);
        return true;
    }

    /*
     * Secondary purchase for the biglietti
     * Modifier to validate that the selling price shouldn't exceed 110% of purchase price for peer to peer transfers
     * Adds new cliente if not exists
     * Adds acquirente to biglietti mapping
     * Remove ticket from the venditore and from sale
     * Update ticket details
     */
     // qui compro dal secondary market
    function secondaryTransferTicket(address acquirente, uint256 saleTicketId)
        public
        isValidSellAmount(saleTicketId)
    {
        address venditore = ownerOf(saleTicketId);
        uint256 prezzoRivendita = _dettagliBiglietto[saleTicketId].prezzoRivendita;

        transferFrom(venditore, acquirente, saleTicketId);

        if (!clienteEsistente(acquirente)) {
            clienti.push(acquirente);
        }

        bigliettiAcquistati[acquirente].push(saleTicketId);

        rimuoviBigliettoCliente(venditore, saleTicketId);
        rimuoviBigliettoRivendita(saleTicketId);

        _dettagliBiglietto[saleTicketId] = TicketDetails({
            prezzoAcquisto: prezzoRivendita,
            prezzoRivendita: 0,
            forSale: false
        });
    }

    /*
     * Add ticket for sale with its details
     * Validate that the selling price shouldn't exceed 110% of purchase price
     * Organiser can not use secondary market sale
     */
    // qui metto in vendita l'event nel secondary market
    function setSaleDetails(
        uint256 idBiglietto,
        uint256 prezzoRivendita,
        address operator
    ) public {
        uint256 prezzoAcquisto = _dettagliBiglietto[idBiglietto].prezzoAcquisto;

        require(
            prezzoAcquisto + ((prezzoAcquisto * 110) / 100) > prezzoRivendita,
            "Re-selling price is more than 110%"
        );

        // Should not be an organizzatore
        require(
            !hasRole(MINTER_ROLE, _msgSender()),
            "Functionality only allowed for secondary market"
        );

        _dettagliBiglietto[idBiglietto].prezzoRivendita = prezzoRivendita;
        _dettagliBiglietto[idBiglietto].forSale = true;

        if (!bigliettoInRivendita(idBiglietto)) {
            bigliettiInVendita.push(idBiglietto);
        }

        approve(operator, idBiglietto);
    }

    // Get ticket actual price
    function getPrezzoBiglietto() public view returns (uint256) {
        return _prezzoBiglietto;
    }

    // Get organizzatore's address
    function getOrganizzatore() public view returns (address) {
        return _organizzatore;
    }

    // Get current idBiglietto
    function countBiglietti() public view returns (uint256) {
        return _idBiglietti.current();
    }

    // Get next sale idBiglietto
    function getNextSaleTicketId() public view returns (uint256) {
        return _saleTicketId.current();
    }

    // Get selling price for the ticket
    function getPrezzoRivendita(uint256 idBiglietto) public view returns (uint256) {
        return _dettagliBiglietto[idBiglietto].prezzoRivendita;
    }

    // Get all biglietti available for sale
    function getBigliettiInVendita() public view returns (uint256[] memory) {
        return bigliettiInVendita;
    }

    // Get ticket details
    function getDettagliBiglietto(uint256 idBiglietto)
        public
        view
        returns (
            uint256 prezzoAcquisto,
            uint256 prezzoRivendita,
            bool forSale
        )
    {
        return (
            _dettagliBiglietto[idBiglietto].prezzoAcquisto,
            _dettagliBiglietto[idBiglietto].prezzoRivendita,
            _dettagliBiglietto[idBiglietto].forSale
        );
    }

    // Get all biglietti owned by a cliente
    function getBigliettiCliente(address cliente)
        public
        view
        returns (uint256[] memory)
    {
        return bigliettiAcquistati[cliente];
    }

    // Utility function to check if cliente exists to avoid redundancy
    function clienteEsistente(address acquirente) internal view returns (bool) {
        for (uint256 i = 0; i < clienti.length; i++) {
            if (clienti[i] == acquirente) {
                return true;
            }
        }
        return false;
    }

    // Utility function used to check if ticket is already for sale
    function bigliettoInRivendita(uint256 idBiglietto)
        internal
        view
        returns (bool)
    {
        for (uint256 i = 0; i < bigliettiInVendita.length; i++) {
            if (bigliettiInVendita[i] == idBiglietto) {
                return true;
            }
        }
        return false;
    }

    // Utility function to remove ticket owned by cliente from cliente to ticket mapping
    function rimuoviBigliettoCliente(address cliente, uint256 idBiglietto)
        internal
    {
        uint256 numOfTickets = bigliettiAcquistati[cliente].length;

        for (uint256 i = 0; i < numOfTickets; i++) {
            if (bigliettiAcquistati[cliente][i] == idBiglietto) {
                for (uint256 j = i + 1; j < numOfTickets; j++) {
                    bigliettiAcquistati[cliente][j - 1] = bigliettiAcquistati[
                        cliente
                    ][j];
                }
                bigliettiAcquistati[cliente].pop();
            }
        }
    }

    // Utility function to remove ticket from sale list
    function rimuoviBigliettoRivendita(uint256 idBiglietto) internal {
        uint256 numOfTickets = bigliettiInVendita.length;

        for (uint256 i = 0; i < numOfTickets; i++) {
            if (bigliettiInVendita[i] == idBiglietto) {
                for (uint256 j = i + 1; j < numOfTickets; j++) {
                    bigliettiInVendita[j - 1] = bigliettiInVendita[j];
                }
                bigliettiInVendita.pop();
            }
        }
    }
}
