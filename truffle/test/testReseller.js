const organizer = "0xed9d02e382b34818e88B88a309c7fe71E65f419d";
const client  = "0xB4dc6aE681Fa6D5433e68D76aC9318b734F49001";
const client2 = "0x81559247E62fDb78A43e9535f064ED62B11B6830";

const Event = artifacts.require("Event");
const EventFactory = artifacts.require("EventFactory");
const Reseller = artifacts.require("Reseller");

contract("Reseller", async (accounts) => {
  it("Acquisto biglietto da parte di un utente", async () => {
    const eventFactory = await EventFactory.deployed();
    await eventFactory.createNewEvent("Maneskin", "msk", 2, 2, 300122, {
      from: organizer,
    });
    const eventList = await eventFactory.getEventList();

    const reseller = await Reseller.deployed();
    await reseller.purchaseTicket(eventList[0], {
      from: client,
      value: 0.1 * 10,
    });
    let balance = await web3.eth.getBalance(reseller.address);
    //const b  = await reseller.getBalance();
    // console.log(balance);
  });

  it("Mostra tutti i biglietti dell'utente", async () => {
    const eventFactory = await EventFactory.deployed();
    await eventFactory.createNewEvent("Ultimo", "Ult", 1, 2, 300122, {
      from: organizer,
    });
    await eventFactory.createNewEvent("valentinaNappi", "PrN0", 2, 9, 090122, {
      from: organizer,
    });
    const eventList = await eventFactory.getEventList();

    const reseller = await Reseller.deployed();
    await reseller.purchaseTicket(eventList[0], {
      from: client,
      value: 0.1 * 10,
    });
    await reseller.purchaseTicket(eventList[1], {
      from: client2,
      value: 0.2 * 10,
    });
    // console.log(eventList);

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

    // console.log('client 1: ', tickets);
    // console.log('client 2: ', tickets2);
    
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
    // console.log(tickets);
    // console.log(tmp1_1[0].words[0]);
    // console.log(tmp2_1)
    
    const reseller = await Reseller.deployed();
    // esibisco il ticket
    await reseller.checkIN(eventList[0], client, 1);
    var ticketState = await eventIstance.getTicketState(1);
    console.log(ticketState);
    // controllore verifica il ticket
    var lollo = await eventIstance.checkTicket(1);
    ticketState = await eventIstance.getTicketState(1);
    // console.log(lollo);
    console.log(ticketState);


    // await reseller.checkIN(eventList[0], client2, 1);
    // 0x1F4d13c54a8EddCf556f0EC6d23f21A7A4700429
  });

});
