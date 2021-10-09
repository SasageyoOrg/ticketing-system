const CreazioneEvento = artifacts.require("CreazioneEvento");

module.exports = function (deployer) {
  deployer.deploy(CreazioneEvento, "0xC9C913c8c3C1Cd416d80A0abF475db2062F161f6");
};
