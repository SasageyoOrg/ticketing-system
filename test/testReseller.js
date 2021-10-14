const organizer = "0x17274D794A0238707298380f4E1B4b304F51e8ed";
const client  = "0x1F4d13c54a8EddCf556f0EC6d23f21A7A4700429";
const client2 = "0x16AA3348cE191DB5F63D28F427A243c18c332536";

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
      value: 0.1 * 1000000000000000000,
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
      value: 0.1 * 1000000000000000000,
    });
    await reseller.purchaseTicket(eventList[1], {
      from: client2,
      value: 0.2 * 1000000000000000000,
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
  
  it("Esibisci e Verifica Ticket", async () => {
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
    console.log(tmp2_1)
    
    const reseller = await Reseller.deployed();
    await reseller.checkIN(eventList[0], client, 1);
    var lollo = await eventIstance.checkTicket(1);
    console.log(lollo);

    await reseller.checkIN(eventList[0], client2, 1);
    // 0x1F4d13c54a8EddCf556f0EC6d23f21A7A4700429
  });

});
