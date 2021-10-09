// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./EventoNFT.sol";
import "./Biglietteria.sol";

contract CreazioneEvento is Ownable, AccessControl {
    bytes32 public constant ORGANISER_ROLE = keccak256("ORGANISER_ROLE");
    struct Evento {
        string nomeEvento;
        //string simboloEvento;
        uint256 prezzoBiglietto;
        uint256 bigliettiDisponibili;
        address biglietteria;
    }

    address[] private eventiAttivi;
    mapping(address => Evento) private mappingEventiAttivi;

    event Created(address ntfAddress, address addressBiglietteria);

    constructor(address organizzatore) public {
        _setupRole(ORGANISER_ROLE, organizzatore);
    }

    // Creates new NFT and a marketplace for its purchase
    function createNewFest(
        // FestToken token,
        string memory nomeEvento,
        // string memory simboloEvento,
        uint256 prezzoBiglietto,
        uint256 bigliettiDisponibili
    ) public onlyOwner returns (address) {

        require(hasRole(ORGANISER_ROLE, msg.sender), "Caller is not allowed");

        EventoNFT nuovoEvento =
            new EventoNFT(
                nomeEvento,
                prezzoBiglietto,
                bigliettiDisponibili,
                msg.sender
            );

        //Biglietteria nuovaBiglietteria = new Biglietteria(token, nuovoEvento);
        // token non serve più perchè eliminato da costruttore Biglietteria
        Biglietteria nuovaBiglietteria = new Biglietteria(nuovoEvento);
        address addressNuovoEvento = address(nuovoEvento);
        eventiAttivi.push(addressNuovoEvento);

        mappingEventiAttivi[addressNuovoEvento] = Evento({
            nomeEvento: nomeEvento,
            prezzoBiglietto: prezzoBiglietto,
            bigliettiDisponibili: bigliettiDisponibili,
            biglietteria: address(nuovaBiglietteria)
        });

        emit Created(addressNuovoEvento, address(nuovaBiglietteria));

        return addressNuovoEvento;
    }

    // Get all active eventi
    function getEventiAttivi() public view returns (address[] memory) {
        return eventiAttivi;
    }

    // Get evento's details
    function getDettagliEvento(address addressEvento)
        public
        view
        returns (
            string memory,
            //string memory,
            uint256,
            uint256,
            address
        )
    {
        return (
            mappingEventiAttivi[addressEvento].nomeEvento,
            //mappingEventiAttivi[addressEvento].simboloEvento,
            mappingEventiAttivi[addressEvento].prezzoBiglietto,
            mappingEventiAttivi[addressEvento].bigliettiDisponibili,
            mappingEventiAttivi[addressEvento].biglietteria
        );
    }
}
