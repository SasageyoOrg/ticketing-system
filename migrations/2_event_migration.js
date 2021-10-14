const organizer = "0xC9C913c8c3C1Cd416d80A0abF475db2062F161f6";

const EventFactory  = artifacts.require("EventFactory");
const Reseller      = artifacts.require("Reseller");

module.exports = async function (deployer) {
  await deployer.deploy(Reseller, organizer).then(function () {
    return deployer.deploy(EventFactory, organizer, Reseller.address);
  })
  // const resellerAddress = await Reseller.deployed().address;

  // await deployer.deploy(EventFactory, "0x711D7d4Bec29fC7fB1dabB03BCB9eA216262FbAf", resellerAddress);
};
