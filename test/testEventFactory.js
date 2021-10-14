const organizer = "0xC9C913c8c3C1Cd416d80A0abF475db2062F161f6";

const Event = artifacts.require("Event");
const EventFactory = artifacts.require("EventFactory");

contract("EventFactory", async accounts => {

  it ( "Creazione Evento da parte del'organizzatore", async () => {  
    const eventFactory = await EventFactory.deployed();
    //const eventFactoryAddress = eventFactory.address;
    await eventFactory.createNewEvent("Maneskin","MSK",10,100,101022,{
      from: organizer
    });
    await eventFactory.createNewEvent("Ultimo","Ult",29,2,300122,{
      from: organizer
    });
    
  });
  
  it ( "Mostra eventi creati", async () => {  
    const eventFactory = await EventFactory.deployed();
    const eventList = await eventFactory.getEventList();
    //console.log(eventList);
  });

  it ( "Mostra dettaglii evento creato", async () => {  
    const eventFactory = await EventFactory.deployed();
    const eventList = await eventFactory.getEventList();
    const eventDetails = await eventFactory.getEventDetails(eventList[1]);
    //console.log(eventDetails);
  });

})