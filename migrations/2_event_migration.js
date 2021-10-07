const CreazioneEvento = artifacts.require("CreazioneEvento");

module.exports = function (deployer) {
  deployer.deploy(CreazioneEvento);
};
