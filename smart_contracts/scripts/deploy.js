const hre = require("hardhat");

const fs = require('fs');
const path = require('path');

function addEnvVariable(filePath, key, value) {
    const envFilePath = path.resolve(filePath);

    if (!fs.existsSync(envFilePath)) {
        console.log('.env file does not exist. Creating a new one.');
    }

    let envContent = '';
    if (fs.existsSync(envFilePath)) {
        envContent = fs.readFileSync(envFilePath, 'utf8');
    }

    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(envContent)) {
        console.log(`The key "${key}" already exists in the .env file.`);
    } else {
        const newEntry = `\n${key}=${value}`;
        envContent += newEntry;

        fs.writeFileSync(envFilePath, envContent, 'utf8');
        console.log(`Successfully added "${key}=${value}" to the .env file.`);
    }
}




async function main() {
    const MasterContract = await hre.ethers.getContractFactory("MasterContract");
    const PasswordContract = await hre.ethers.getContractFactory("PasswordContract");
    const masterContract = await MasterContract.deploy();
    const passwordContract = await PasswordContract.deploy();

    await masterContract.waitForDeployment();
    const m = await masterContract.getAddress();
    console.info(`MASTER: ${m}`);
    addEnvVariable('../.env', 'MASTERCONTRACTADDRESS', m);

    await passwordContract.waitForDeployment();
    const p = await passwordContract.getAddress();
    console.info(`PASSWORD: ${p}`);
    addEnvVariable('../.env', 'PASSWORDCONTRACTADDRESS', p);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});