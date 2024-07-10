// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MasterContract {
    struct User {
            address userAddress;
            string email;
            bytes32 encryptedMasterPassword;
            bytes32 encryptionKey;
        }

    mapping(address => User) public users;

    event UserRegistered(address indexed userAddress, string email);

    function registerUser(string memory email, bytes32 encryptedMasterPassword, bytes32 encryptionKey) public {
        require(users[msg.sender].userAddress == address(0), "User already registered");
        require(bytes(email).length > 0, "Email cannot be empty");
        require(encryptedMasterPassword != bytes32(0), "Encrypted password cannot be empty");
        require(encryptionKey != bytes32(0), "Encrypted password cannot be empty");

        users[msg.sender] = User({
            userAddress: msg.sender,
            email: email,
            encryptedMasterPassword: encryptedMasterPassword,
            encryptionKey: encryptionKey
        });

        emit UserRegistered(msg.sender, email);
    }

    function getEncryptedMasterPassword() public view returns (bytes32, bytes32) {
        require(users[msg.sender].userAddress != address(0), "User not registered");

        return users[msg.sender].encryptedMasterPassword, users[msg.sender].encryptionKey;
    }
} 