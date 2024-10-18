const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const app = express();
const port = 3000;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

app.use(cors());
app.use(express.json());

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`);
const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

const masterContractAddress = process.env.MASTERCONTRACTADDRESS;
const passwordContractAddress = process.env.PASSWORDCONTRACTADDRESS;

const masterABI = [
    {
        "inputs": [
          { "internalType": "string", "name": "_name", "type": "string" },
          { "internalType": "string", "name": "_email", "type": "string" },
          { "internalType": "bytes32", "name": "_encryptedMasterPassword", "type": "bytes32" }
        ],
        "name": "registerUser",
        "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    {
        "inputs": [], "name": "getUsername",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view", "type": "function", "constant": true
    },
    {
        "inputs": [], "name": "getMasterPassword",
        "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "stateMutability": "view", "type": "function", "constant": true
    }
];

const passwordABI = [
  { "name": "PasswordAdded", "inputs": [{ "internalType": "string", "name": "service", "type": "string" }], "anonymous": false, "type": "event" },
  { "name": "PasswordDeleted", "inputs": [{ "internalType": "string", "name": "service", "type": "string" }], "anonymous": false, "type": "event" },
  { "name": "PasswordUpdated", "inputs": [{ "internalType": "string", "name": "service", "type": "string" }], "anonymous": false, "type": "event" },
  { "name": "addPassword", "inputs": [{ "internalType": "string", "name": "_service", "type": "string" }, { "internalType": "bytes32", "name": "_username", "type": "bytes32" }, { "internalType": "bytes32", "name": "_password", "type": "bytes32" }], "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "name": "getPassword", "inputs": [{ "internalType": "string", "name": "_service", "type": "string" }], "outputs": [{ "components": [{ "internalType": "string", "name": "service", "type": "string" }, { "internalType": "bytes32", "name": "username", "type": "bytes32" }, { "internalType": "bytes32", "name": "password", "type": "bytes32" }], "internalType": "struct PasswordContract.Password", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function", "constant": true },
  { "name": "editPassword", "inputs": [{ "internalType": "string", "name": "_service", "type": "string" }, { "internalType": "bytes32", "name": "_username", "type": "bytes32" }, { "internalType": "bytes32", "name": "_password", "type": "bytes32" }], "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "name": "deletePassword", "inputs": [{ "internalType": "string", "name": "_service", "type": "string" }], "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "name": "getAllPasswords", "inputs": [], "outputs": [{ "components": [{ "internalType": "string", "name": "service", "type": "string" }, { "internalType": "bytes32", "name": "username", "type": "bytes32" }, { "internalType": "bytes32", "name": "password", "type": "bytes32" }], "internalType": "struct PasswordContract.Password[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function", "constant": true }
];

const masterContract = new ethers.Contract(masterContractAddress, masterABI, wallet);
const passwordContract = new ethers.Contract(passwordContractAddress, passwordABI, wallet);

const crypto = require('crypto');

const hashPassword = (masterPassword) => {
    const hash = crypto.createHash('sha256'); // Create a SHA-256 hash instance
    hash.update(masterPassword); // Update the hash with the password
    const encryptedMasterPasswordHex = hash.digest('hex'); // Generate the hash in hexadecimal format
    return Buffer.from(encryptedMasterPasswordHex, 'hex'); // Convert hex to bytes (Buffer)
};

// Function to compare passwords
const comparePasswords = (plaintextPassword, storedHashedPasswordHex) => {
    const hashedPlaintextPassword = hashPassword(plaintextPassword); // Hash the input password
    const storedHashedPasswordBuffer = Buffer.from(storedHashedPasswordHex, 'hex'); // Convert hex string to Buffer
    return hashedPlaintextPassword.equals(storedHashedPasswordBuffer); // Compare the buffers
};

const getStoredHashedPassword = async () => {
    try {
        const masterPassword = await masterContract.getMasterPassword();
        return masterPassword
    } catch (error) {
        console.error(error)
    }
}

app.post('/registerUser', async (req, res) => {
    const { name, email, masterPassword } = req.body; // Receive plaintext master password
    try {
        encryptedMasterPassword = hashPassword(masterPassword);
        const tx = await masterContract.registerUser(name, email, encryptedMasterPassword); // Pass hashed password
        await tx.wait();
        res.send(`User registered with name: ${name}, email: ${email}`);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send('Error registering user');
    }
});

app.post('/loginUser', async (req, res) => {
    const { password } = req.body; 
    const storedHashedPasswordHex = await getStoredHashedPassword(); 

    if (!storedHashedPasswordHex) {
        return res.status(401).send('User not found');
    }

    const isPasswordValid = comparePasswords(password, storedHashedPasswordHex);

    if (isPasswordValid) {
        res.send('Login successful');
    } else {
        res.status(401).send('Invalid password');
    }
});

app.get('/getUsername', async (req, res) => {
    try {
        const username = await masterContract.getUsername();
        res.send(`Username: ${username}`);
    } catch (error) {
        res.status(500).send('Error getting username');
    }
});

app.post('/addPassword', async (req, res) => {
    const { service, username, password } = req.body;
    try {
        // password
        var hash = crypto.createHash('sha256'); // Create a SHA-256 hash instance
        hash.update(password); // Update the hash with the password
        const passwordHex = hash.digest('hex'); // Generate the hash in hexadecimal format
        const encPassword = Buffer.from(passwordHex, 'hex');
        // username
        var hash = crypto.createHash('sha256'); // Create a SHA-256 hash instance
        hash.update(username); // Update the hash with the password
        const usernameHex = hash.digest('hex'); // Generate the hash in hexadecimal format
        const encUsername = Buffer.from(usernameHex, 'hex');
        // commit
        const tx = await passwordContract.addPassword(service, encUsername, encPassword);
        await tx.wait();
        res.send(`Password added for service: ${service} ${encUsername} ${encPassword}`);
    } catch (error) {
        console.error(error)
        res.status(500).send('Error adding password');
    }
});

app.get('/getPassword:service', async (req, res) => {
    const { service } = req.params;
    try {
        console.log(service);
        const passwordDetails = await passwordContract.getPassword(service);
        console.log(service);
        res.send({
            service: passwordDetails.service,
            username: ethers.utils.parseBytes32String(passwordDetails.username),
            password: ethers.utils.parseBytes32String(passwordDetails.password)
        });
    } catch (error) {
        res.status(500).send('Error retrieving password');
    }
});

app.put('/editPassword', async (req, res) => {
    const { service, username, password } = req.body;
    try {
        const tx = await passwordContract.editPassword(service, ethers.utils.formatBytes32String(username), ethers.utils.formatBytes32String(password));
        await tx.wait();
        res.send(`Password updated for service: ${service}`);
    } catch (error) {
        res.status(500).send('Error updating password');
    }
});

app.delete('/deletePassword/:service', async (req, res) => {
    const { service } = req.params;
    try {
        const tx = await passwordContract.deletePassword(service);
        await tx.wait();
        res.send(`Password deleted for service: ${service}`);
    } catch (error) {
        res.status(500).send('Error deleting password');
    }
});

app.get('/getAllPasswords', async (req, res) => {
    try {
        const passwords = await passwordContract.getAllPasswords();
        const formattedPasswords = passwords.map(pw => ({
            service: pw.service,
            username: ethers.utils.parseBytes32String(pw.username),
            password: ethers.utils.parseBytes32String(pw.password)
        }));
        res.json(formattedPasswords);
    } catch (error) {
        res.status(500).send('Error retrieving all passwords');
    }
});

app.listen(port, () => {
    console.log(`Server 🏃 at http://localhost:${port}`);
});
