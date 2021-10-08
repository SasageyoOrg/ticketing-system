// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./EventoNFT.sol";

contract Biglietteria {
    EventoNFT private _festival;

    address private _organiser;

    constructor(EventoNFT festival) public {
        _festival = festival;
        _organiser = _festival.getOrganiser();
    }

    event Purchase(address indexed buyer, address seller, uint256 ticketId);

    // Purchase tickets from the organiser directly
    function purchaseTicket() public payable {
        address buyer = msg.sender;

        //require(msg.value == _festival.getTicketPrice(), "Messaggio di provaaaaa");

        // send ETH from buyer (msg.sender) to the organiser 
        (bool sent, bytes memory data) = payable(_organiser).call{value: msg.value}("");

        require(sent, "Failed to send Ether");
        //_token.transferFrom(buyer, _organiser, _festival.getTicketPrice());
        
        bool ticketTransfered = _festival.transferTicket(buyer);
        require(ticketTransfered, "Failed ticket transfer");
    }

    // ...

    // Purchase ticket from the secondary market hosted by organiser
    function secondaryPurchase(uint256 ticketId) public payable {
        address seller = _festival.ownerOf(ticketId);
        address buyer = msg.sender;
        uint256 sellingPrice = _festival.getSellingPrice(ticketId);
        uint256 commision = (sellingPrice * 10) / 100;

        //_token.transferFrom(buyer, seller, sellingPrice - commision);
        //_token.transferFrom(buyer, _organiser, commision);

        payable(seller).transfer(sellingPrice - commision);
        payable(_organiser).transfer(commision);

        _festival.secondaryTransferTicket(buyer, ticketId);

        emit Purchase(buyer, seller, ticketId);
    }
}
