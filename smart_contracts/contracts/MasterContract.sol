// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MasterContract {
    string name;
    string email;
    bytes32 encryptedMasterPassword;

    function registerUser(string memory _name, string memory _email, bytes32 _encryptedMasterPassword) public {
        name = _name;
        email = _email;
        encryptedMasterPassword = _encryptedMasterPassword;
    }

    function getUsername() public view returns(string memory) {
        return name;
    }

    function getMasterPassword() public view returns(bytes32) {
        return encryptedMasterPassword;
    }
}