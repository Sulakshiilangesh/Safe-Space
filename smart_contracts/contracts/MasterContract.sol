// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MasterContract {
    string name;
    string email;
    bytes32 encryptedMasterPassword;

    event userRegistered(string name);
    event userDeleted(string name);

    function registerUser(string memory _name, string memory _email, bytes32 _encryptedMasterPassword) public {
        name = _name;
        email = _email;
        encryptedMasterPassword = _encryptedMasterPassword;

        emit userRegistered(name);
    }

    function getUsername() public view returns(string memory) {
        return name;
    }

    function getMasterPassword() public view returns(bytes32) {
        return encryptedMasterPassword;
    }

    function deleteUser() public{
        string memory r = name;
        name = "";
        email = "";
        encryptedMasterPassword = bytes32(0);

        emit userDeleted(r);
    }    
}