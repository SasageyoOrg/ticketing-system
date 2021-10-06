const FestToken = artifacts.require("FestToken");
const FestiveTicketsFactory = artifacts.require("FestiveTicketsFactory");

module.exports = function (deployer) {
  deployer.deploy(FestToken);
  deployer.deploy(FestiveTicketsFactory, "0x43CdA9c0610049499A189D573F23CCb2928E79b4");
};
