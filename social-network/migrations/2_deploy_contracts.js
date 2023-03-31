const SocialDApp = artifacts.require("SocialDApp");

module.exports = function(deployer) {
  deployer.deploy(SocialDApp);
};