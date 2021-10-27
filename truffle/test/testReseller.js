const organizer = "0xed9d02e382b34818e88B88a309c7fe71E65f419d";
const client  = "0xB4dc6aE681Fa6D5433e68D76aC9318b734F49001";
const client2 = "0x81559247E62fDb78A43e9535f064ED62B11B6830"; //ticket inspector

const Event = artifacts.require("Event");
const EventFactory = artifacts.require("EventFactory");
const Reseller = artifacts.require("Reseller");

contract("Reseller", async (accounts) => {
  it("Acquisto biglietto da parte di un utente", async () => {
    const eventFactory = await EventFactory.deployed();
    await eventFactory.createNewEvent("Maneskin", "MSK", 10, 100, 101022, "ManeskinMSK101022",{
      from: organizer
    });
    const eventList = await eventFactory.getEventList();
    console.log("\n\tEvento creato correttamente:");
    console.log("\t\tManeskin 10/10/22");

    const reseller = await Reseller.deployed();
    await reseller.purchaseTicket(eventList[0], {
      from: client,
      value: 0.1 * 10,
    });
    console.log("\n\tCliente 1 compra un ticket dell'evento di Maneskin");

  });

  it("Mostra tutti i biglietti dell'utente", async () => {
    const eventFactory = await EventFactory.deployed();
    await eventFactory.createNewEvent("Ultimo", "Ult", 1, 2, 300122, "UltimoUlt300122", {
      from: organizer,
    });
    await eventFactory.createNewEvent("Cinqueminuti", "5m", 2, 9, 090122, "Cinqueminuti5m090122", {
      from: organizer,
    });
    const eventList = await eventFactory.getEventList();
    console.log("\n\tEventi creati:");
    console.log("\t\tUltimo 30/01/22");
    console.log("\t\tCinqueminuti 09/01/22");

    const reseller = await Reseller.deployed();
    await reseller.purchaseTicket(eventList[1], {
      from: client,
      value: 0.1 * 10,
    });
    console.log("\n\tCliente 1 compra un ticket dell'evento di Ultimo");
    await reseller.purchaseTicket(eventList[2], {
      from: client2,
      value: 0.2 * 10,
    });
    console.log("\tCliente 2 compra un ticket dell'evento dei Cinqueminuti");

    const eventIstance = await Event.at(eventList[0]);
    const eventIstance2 = await Event.at(eventList[1]);
    const eventIstance3 = await Event.at(eventList[2]);
    var tmp1_1 = await eventIstance.getPurchasedTicketsOfCustomer(client);
    var tmp1_2 = await eventIstance2.getPurchasedTicketsOfCustomer(client);
    var tmp1_3 = await eventIstance3.getPurchasedTicketsOfCustomer(client);
    var tickets = [];
    tickets.push(tmp1_1);
    tickets.push(tmp1_2);
    tickets.push(tmp1_3);

    var tmp2_1 = await eventIstance.getPurchasedTicketsOfCustomer(client2);
    var tmp2_2 = await eventIstance2.getPurchasedTicketsOfCustomer(client2);
    var tmp2_3 = await eventIstance3.getPurchasedTicketsOfCustomer(client2);
    var tickets2 = [];
    tickets2.push(tmp2_1);
    tickets2.push(tmp2_2);
    tickets2.push(tmp2_3);

    console.log("\n\tBiglietti Cliente 1: ");
    console.log("\t\t->Ticket Evento Maneskin: " + tickets[0].length);
    console.log("\t\t->Ticket Evento Ultimo: " + tickets[1].length);
    console.log("\t\t->Ticket Evento Cinqueminuti: " + tickets[2].length);
    console.log("\tBiglietti Cliente 2: ");
    console.log("\t\t->Ticket Evento Maneskin: " + tickets2[0].length);
    console.log("\t\t->Ticket Evento Ultimo: " + tickets2[1].length);
    console.log("\t\t->Ticket Evento Cinqueminuti: " + tickets2[2].length);
    
  }); 
  
  it("Cliente esibisce ticket e il controllore lo verifica", async () => {
    const eventFactory = await EventFactory.deployed();
    const eventList = await eventFactory.getEventList();

    const eventIstance = await Event.at(eventList[0]);
    const eventIstance2 = await Event.at(eventList[1]);
    const eventIstance3 = await Event.at(eventList[2]);
    var tmp1_1 = await eventIstance.getPurchasedTicketsOfCustomer(client);
    var tmp1_2 = await eventIstance2.getPurchasedTicketsOfCustomer(client);
    var tmp1_3 = await eventIstance3.getPurchasedTicketsOfCustomer(client);
    var tickets = [];
    tickets.push(tmp1_1);
    tickets.push(tmp1_2);
    tickets.push(tmp1_3);

    var tmp2_1 = await eventIstance.getPurchasedTicketsOfCustomer(client2);
    var tmp2_2 = await eventIstance2.getPurchasedTicketsOfCustomer(client2);
    var tmp2_3 = await eventIstance3.getPurchasedTicketsOfCustomer(client2);
    var tickets2 = [];
    tickets2.push(tmp2_1);
    tickets2.push(tmp2_2);
    tickets2.push(tmp2_3);
    
    const reseller = await Reseller.deployed();
    
    // esibisco il ticket
    console.log("\n\t1)Cliente 1 esibisce il ticket 1 dell'evento dei Maneskin con stato: " + (await eventIstance.getTicketState(1)))
    await reseller.checkIN(eventList[0], client, 1);
    console.log("\t2)Il controllore va ad accettare il ticket con stato: " + (await eventIstance.getTicketState(1)))

    // controllore verifica il ticket
    await eventIstance.checkTicket(1);
    console.log("\t3)CheckIn completo, lo stato del ticket è: " + (await eventIstance.getTicketState(1)))
    
  });

  it("Errore: Acquisto biglietto Sold Out", async () => {
    const eventFactory = await EventFactory.deployed();
    await eventFactory.createNewEvent("Linking Park", "LP", 1, 100, 101022, "LinkingParkLP101022",{
      from: organizer
    });
    const eventList = await eventFactory.getEventList();

    const reseller = await Reseller.deployed();
    await reseller.purchaseTicket(eventList[1], {
      from: client,
      value: 0.1 * 10,
    });
    try {
      await reseller.purchaseTicket(eventList[1], {
        from: client,
        value: 0.1 * 10,
      });
    } catch (error) {
        // console.error("Errore: Evento SoldOut")
    }
    
  });

  // Vari casi d'uso che generano errore nel checkIN,
  // si andrà a considerare solamente il cliente 1 e l'evento 1
  it("Errore CheckIn: biglietto gia esibito", async () => {
    const eventFactory = await EventFactory.deployed();
    const eventList = await eventFactory.getEventList();

    const eventIstance = await Event.at(eventList[0]);
    var tmp1_1 = await eventIstance.getPurchasedTicketsOfCustomer(client);
    var tickets = [];
    tickets.push(tmp1_1);
    
    const reseller = await Reseller.deployed();
    
    try {
      await reseller.checkIN(eventList[0], client, 1);
      await reseller.checkIN(eventList[0], client, 1);
      await eventIstance.checkTicket(1);
    } catch (error) {
        // console.error("Errore: biglietto gia esibito")
    }
  });

  it("Errore CheckIn: biglietto esibito da un utente diverso dal acquirente", async () => {
    const eventFactory = await EventFactory.deployed();
    const eventList = await eventFactory.getEventList();

    const eventIstance = await Event.at(eventList[0]);
    var tmp1_1 = await eventIstance.getPurchasedTicketsOfCustomer(client);
    var tickets = [];
    tickets.push(tmp1_1);
    
    const reseller = await Reseller.deployed();
    
    try {
      await reseller.checkIN(eventList[0], client2, 1);
      await eventIstance.checkTicket(1);
    } catch (error) {
        // console.error("Errore: biglietto gia esibito da un contraffattore") 
    }
  });

  it("Errore CheckIn: biglietto/evento non esistente", async () => {
    const eventFactory = await EventFactory.deployed();
    const eventList = await eventFactory.getEventList();

    const eventIstance = await Event.at(eventList[0]);
    var tmp1_1 = await eventIstance.getPurchasedTicketsOfCustomer(client);
    var tickets = [];
    tickets.push(tmp1_1);
    
    const reseller = await Reseller.deployed();
    
    try {
      await reseller.checkIN(eventList[0], client, 7);
      await eventIstance.checkTicket(7);
    } catch (error) {
        // console.error("Errore: biglietto/evento non esistente") 
    }
  });

});
