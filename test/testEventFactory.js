const organizer = "0x17274D794A0238707298380f4E1B4b304F51e8ed";

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