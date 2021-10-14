// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EventoNFT.sol";
import "./Biglietteria.sol";

contract CreazioneEvento is Ownable {
    
    
    struct Festival {
        string festName;
        //string festSymbol;
        uint256 ticketPrice;
        uint256 totalSupply;
        address marketplace;
    }

    address[] private activeFests;
    mapping(address => Festival) private activeFestsMapping;

    event Created(address ntfAddress, address marketplaceAddress);

    // Creates new NFT and a marketplace for its purchase
    function createNewFest(
        // FestToken token,
        string memory festName,
        // string memory festSymbol,
        uint256 ticketPrice,
        uint256 totalSupply
    ) public onlyOwner returns (address) {
        EventoNFT newFest =
            new EventoNFT(
                festName,
                ticketPrice,
                totalSupply,
                msg.sender
            );

        //Biglietteria newMarketplace = new Biglietteria(token, newFest);
        // token non serve più perchè eliminato da costruttore Biglietteria
        Biglietteria newMarketplace = new Biglietteria(newFest);

        address newFestAddress = address(newFest);

        activeFests.push(newFestAddress);
        activeFestsMapping[newFestAddress] = Festival({
            festName: festName,
            ticketPrice: ticketPrice,
            totalSupply: totalSupply,
            marketplace: address(newMarketplace)
        });

        emit Created(newFestAddress, address(newMarketplace));

        return newFestAddress;
    }

    // Get all active fests
    function getActiveFests() public view returns (address[] memory) {
        return activeFests;
    }

    // Get fest's details
    function getFestDetails(address festAddress)
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
            activeFestsMapping[festAddress].festName,
            //activeFestsMapping[festAddress].festSymbol,
            activeFestsMapping[festAddress].ticketPrice,
            activeFestsMapping[festAddress].totalSupply,
            activeFestsMapping[festAddress].marketplace
        );
    }
}
