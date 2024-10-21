const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
const app = express();
const port = 3000;
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

app.use(cors());
app.use(express.json());

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
);
const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

const masterContractAddress = process.env.MASTERCONTRACTADDRESS;
const passwordContractAddress = process.env.PASSWORDCONTRACTADDRESS;

const masterABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "userDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "userRegistered",
    type: "event",
  },
  {
    inputs: [],
    name: "deleteUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getMasterPassword",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUsername",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_email", type: "string" },
      {
        internalType: "bytes32",
        name: "_encryptedMasterPassword",
        type: "bytes32",
      },
    ],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const passwordABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "service",
        type: "string",
      },
    ],
    name: "PasswordAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "service",
        type: "string",
      },
    ],
    name: "PasswordDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "service",
        type: "string",
      },
    ],
    name: "PasswordUpdated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "_service", type: "string" },
      { internalType: "string", name: "_username", type: "string" },
      { internalType: "string", name: "_password", type: "string" },
    ],
    name: "addPassword",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_service", type: "string" }],
    name: "deletePassword",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_service", type: "string" },
      { internalType: "string", name: "_username", type: "string" },
      { internalType: "string", name: "_password", type: "string" },
    ],
    name: "editPassword",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllPasswords",
    outputs: [
      {
        components: [
          { internalType: "string", name: "service", type: "string" },
          { internalType: "string", name: "username", type: "string" },
          { internalType: "string", name: "password", type: "string" },
        ],
        internalType: "struct PasswordContract.Password[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_service", type: "string" }],
    name: "getPassword",
    outputs: [
      {
        components: [
          { internalType: "string", name: "service", type: "string" },
          { internalType: "string", name: "username", type: "string" },
          { internalType: "string", name: "password", type: "string" },
        ],
        internalType: "struct PasswordContract.Password",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const masterContract = new ethers.Contract(
  masterContractAddress,
  masterABI,
  wallet
);
const passwordContract = new ethers.Contract(
  passwordContractAddress,
  passwordABI,
  wallet
);

const crypto = require("crypto");

const hashPassword = (masterPassword) => {
  // Create a SHA-256 hash of the master password
  const hash = crypto.createHash("sha256");
  hash.update(masterPassword);
  const hashedPassword = hash.digest("hex"); // Get the hash in hexadecimal format

  // Ensure the hashed password is exactly 64 characters (32 bytes)
  if (hashedPassword.length !== 64) {
    throw new Error("Hashing failed to produce a valid bytes32 output");
  }

  return Buffer.from(hashedPassword, "hex");
};

const deriveKey = (masterPassword, salt) => {
  const iterations = 100000; // Number of iterations
  const keyLength = 32; // Key length in bytes (256 bits for AES-256)
  return crypto.pbkdf2Sync(
    masterPassword,
    salt,
    iterations,
    keyLength,
    "sha256"
  );
};

// Helper function to encrypt a password using AES
const encryptPassword = (password, masterPassword) => {
  const salt = crypto.randomBytes(16);
  const key = deriveKey(masterPassword, salt);
  const iv = crypto.randomBytes(16); // 16 bytes for AES

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    encryptedPassword: encrypted,
  };
};

const decryptPassword = (encryptedPassword, salt, iv, masterPassword) => {
  // Convert salt and iv back to Buffers
  const saltBuffer = Buffer.from(salt, "hex");
  const ivBuffer = Buffer.from(iv, "hex");

  // Derive the same key using the master password and salt
  const key = deriveKey(masterPassword, saltBuffer);

  // Create decipher object using the key and iv
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuffer);
  let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

// Function to compare passwords
const comparePasswords = (plaintextPassword, storedHashedPasswordHex) => {
  const hashedPlaintextPassword = hashPassword(plaintextPassword);

  const storedHashedPasswordBuffer = Buffer.from(
    storedHashedPasswordHex.slice(2),
    "hex"
  ); // Convert hex string to Buffer
  return hashedPlaintextPassword.equals(storedHashedPasswordBuffer); // Compare the buffers
};

const getStoredHashedPassword = async () => {
  try {
    const masterPassword = await masterContract.getMasterPassword();
    return masterPassword;
  } catch (error) {
    console.error(error);
  }
};

app.post("/registerUser", async (req, res) => {
  const { name, email, masterPassword } = req.body;
  try {
    encryptedMasterPassword = await hashPassword(masterPassword);
    console.log(name, email, encryptedMasterPassword);
    const tx = await masterContract.registerUser(
      name,
      email,
      encryptedMasterPassword
    ); // Pass hashed password
    await tx.wait();
    res.send('User Registered successfully')
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send("Error registering user");
  }
});

app.delete("/user", async (req, res) => {
  try {
    await masterContract.deleteUser();
    res.send('User Deleted successfully')
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting user");
  }
});

app.post("/loginUser", async (req, res) => {
  const { password } = req.body;
  const storedHashedPasswordHex = await getStoredHashedPassword();

  if (!storedHashedPasswordHex) {
    return res.status(401).send("User not found");
  }
  const isPasswordValid = comparePasswords(password, storedHashedPasswordHex);

  if (isPasswordValid) {
    res.send("Login successful");
  } else {
    res.status(401).send("Invalid password");
  }
});

app.get("/getUsername", async (req, res) => {
  try {
    const username = await masterContract.getUsername();
    res.send(`Username: ${username}`);
  } catch (error) {
    res.status(500).send("Error getting username");
  }
});

app.post("/password", async (req, res) => {
  const { service, username, servicePassword } = req.body;

  // Input validation
  if (!service || !username || !servicePassword) {
    return res
      .status(400)
      .send(
        "Email, service, username, servicePassword, and masterPassword are required."
      );
  }

  storedMaster = await getStoredHashedPassword();

  // password enc
  var { salt, iv, encryptedPassword } = encryptPassword(
    servicePassword,
    storedMaster
  );
  encPassword = encryptedPassword + ":" + salt + ":" + iv;

  // username enc
  var { salt, iv, encryptedPassword } = encryptPassword(username, storedMaster);
  encUsername = encryptedPassword + ":" + salt + ":" + iv;

  // console.log(encUsername, encPassword);

  const tx = await passwordContract.addPassword(
    service,
    encUsername,
    encPassword
  );

  await tx.wait();
  res.status(201).send(`Password for ${service} added successfully.`);
});

app.get("/password", async (req, res) => {
  const { service } = req.query;
  try {
    const passwordDetails = await passwordContract.getPassword(service);
    const [username, salt_u, iv_u] = passwordDetails["username"].split(":");
    const [password, salt_p, iv_p] = passwordDetails["password"].split(":");
    // de password
    storedMaster = await getStoredHashedPassword();

    decPassword = decryptPassword(password, salt_p, iv_p, storedMaster);
    // console.log(decPassword)
    decUsername = decryptPassword(username, salt_u, iv_u, storedMaster);
    // console.log(decUsername)

    res.send({
      service: passwordDetails.service,
      username: decUsername,
      password: decPassword,
    });
  } catch (error) {
    res.status(500).send("Error retrieving password");
  }
});

app.put("/password", async (req, res) => {
  const { service, username, servicePassword } = req.body;

  storedMaster = await getStoredHashedPassword();

  // password enc
  var { salt, iv, encryptedPassword } = encryptPassword(
    servicePassword,
    storedMaster
  );
  encPassword = encryptedPassword + ":" + salt + ":" + iv;

  // username enc
  var { salt, iv, encryptedPassword } = encryptPassword(username, storedMaster);
  encUsername = encryptedPassword + ":" + salt + ":" + iv;

  try {
    const tx = await passwordContract.editPassword(
      service,
      encUsername,
      encPassword
    );
    await tx.wait();
    res.send(`Password updated for service: ${service}`);
  } catch (error) {
    res.status(500).send("Error updating password");
  }
});

app.delete("/password", async (req, res) => {
  const { service } = req.query;
  try {
    const tx = await passwordContract.deletePassword(service);
    await tx.wait();
    res.send(`Password deleted for service: ${service}`);
  } catch (error) {
    res.status(500).send("Error deleting password");
  }
});

app.get("/passwords", async (req, res) => {
  try {
    storedMaster = await getStoredHashedPassword();
    const passwords = await passwordContract.getAllPasswords();
    // console.log(passwords)
    const formattedPasswords = passwords.map((pw) => ({
      service: pw.service,
      username: decryptPassword(
        pw.username.split(":")[0],
        pw.username.split(":")[1],
        pw.username.split(":")[2],
        storedMaster
      ),
      password: decryptPassword(
        pw.password.split(":")[0],
        pw.password.split(":")[1],
        pw.password.split(":")[2],
        storedMaster
      ),
    }));
    res.json(formattedPasswords);
  } catch (error) {
    console.log(error);

    res.status(500).send("Error retrieving all passwords");
  }
});

app.listen(port, async () => {
  console.log(`Server 🏃 at http://localhost:${port}`);
});
