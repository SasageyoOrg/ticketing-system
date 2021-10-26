const organizer = "0xed9d02e382b34818e88B88a309c7fe71E65f419d";

const Event = artifacts.require("Event");
const EventFactory = artifacts.require("EventFactory");

contract("EventFactory", async accounts => {

  it ( "Creazione eventi da parte dell'organizzatore", async () => {  
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

  it ( "Mostra dettagli evento creato", async () => {  
    const eventFactory = await EventFactory.deployed();
    const eventList = await eventFactory.getEventList();
    const eventDetails = await eventFactory.getEventDetails(eventList[1]);
    //console.log(eventDetails);
  });

})