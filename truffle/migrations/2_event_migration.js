const organizer = "0xed9d02e382b34818e88B88a309c7fe71E65f419d";

const EventFactory  = artifacts.require("EventFactory");
const Reseller      = artifacts.require("Reseller");

module.exports = async function (deployer) {
  await deployer.deploy(Reseller, organizer).then(function () {
    return deployer.deploy(EventFactory, organizer, Reseller.address);
  })
};
