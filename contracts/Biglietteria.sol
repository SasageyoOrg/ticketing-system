// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./EventoNFT.sol";

contract Biglietteria {
    EventoNFT private _evento;

    address private _organizzatore;

    constructor(EventoNFT evento) public {
        _evento = evento;
        _organizzatore = _evento.getOrganizzatore();
    }

    event Purchase(address indexed acquirente, address venditore, uint256 idBiglietto);

    // Purchase tickets from the organizzatore directly
    function purchaseTicket() public payable {
        address acquirente = msg.sender;

        //require(msg.value == _evento.getPrezzoBiglietto(), "Messaggio di provaaaaa");

        // send ETH from acquirente (msg.sender) to the organizzatore 
        (bool sent, bytes memory data) = payable(_organizzatore).call{value: msg.value}("");

        require(sent, "Failed to send Ether");
        //_token.transferFrom(acquirente, _organizzatore, _evento.getPrezzoBiglietto());
        
        bool bigliettoTransfered = _evento.trasferisciBiglietto(acquirente);
        require(bigliettoTransfered, "Failed biglietto transfer");
    }

    // ...

    // Purchase ticket from the secondary market hosted by organizzatore
    function secondaryPurchase(uint256 idBiglietto) public payable {
        address venditore = _evento.ownerOf(idBiglietto);
        address acquirente = msg.sender;
        uint256 prezzoRivendita = _evento.getPrezzoRivendita(idBiglietto);
        uint256 commision = (prezzoRivendita * 10) / 100;

        //_token.transferFrom(acquirente, venditore, prezzoRivendita - commision);
        //_token.transferFrom(acquirente, _organizzatore, commision);

        payable(venditore).transfer(prezzoRivendita - commision);
        payable(_organizzatore).transfer(commision);

        _evento.secondaryTransferTicket(acquirente, idBiglietto);

        emit Purchase(acquirente, venditore, idBiglietto);
    }
}
