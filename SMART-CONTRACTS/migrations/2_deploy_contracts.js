// 2_deploy_contracts.js

const masterContract = artifacts.require("MasterContract");
const passwordContract = artifacts.require("PasswordContract");

module.exports = function (deployer) {
    deployer.deploy(masterContract);
    deployer.deploy(passwordContract);
}
