const organizer = "0xed9d02e382b34818e88B88a309c7fe71E65f419d";

const Event = artifacts.require("Event");
const EventFactory = artifacts.require("EventFactory");

contract("EventFactory", async accounts => {

  it ( "Creazione eventi da parte dell'organizzatore", async () => {  
    const eventFactory = await EventFactory.deployed();

    await eventFactory.createNewEvent("Maneskin","MSK",10,100,101022,"ManeskinMSK101022",{
      from: organizer
    });
  });
  it ( "Errore: Creazione evento esistente", async () => {  
    const eventFactory = await EventFactory.deployed();
    try{
      await eventFactory.createNewEvent("Maneskin","MSK",10,100,101022,"ManeskinMSK101022",{
        from: organizer
      });
    }catch(error){
      // console.log("Errore: evento già creato")
    }
  });

  it ( "Errore: Creazione evento da parte di un utente non autorizzato", async () => {  
    const eventFactory = await EventFactory.deployed();
    try{
      await eventFactory.createNewEvent("Maneskin","MSK",10,100,101022,"ManeskinMSK101022",{
        from: "0x81559247E62fDb78A43e9535f064ED62B11B6830"
      });
    }catch(error){
      // console.log("Errore: Creazione evento da parte di un utente non autorizzato)
    }
  });
  
  it ( "Mostra eventi creati", async () => {  
    const eventFactory = await EventFactory.deployed();
    const eventList = await eventFactory.getEventList();
    // console.log(eventList);
  });

  it ( "Mostra dettagli evento creato", async () => {  
    const eventFactory = await EventFactory.deployed();
    const eventList = await eventFactory.getEventList();
    const eventDetails = await eventFactory.getEventDetails(eventList[0]);
    // console.log(eventDetails);
  });

})