// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PasswordContract {
    struct Password {
        string service;
        bytes32 username;
        bytes32 password;
    }

    mapping(string => Password) private passwords;
    string[] private services;

    function addPassword(string memory _service, bytes32 _username, bytes32 _password) public {
        passwords[_service] = Password(_service, _username, _password);
        services.push(_service);
    }

    function getPassword(string memory _service) public view returns(Password memory) {
        return passwords[_service];
    }

    function getAllPasswords() public view returns (Password[] memory) {
        Password[] memory allPasswords = new Password[](services.length);
        for (uint i = 0; i < services.length; i++) {
            allPasswords[i] = passwords[services[i]];
        }
        return allPasswords;
    }

    function editPassword(string memory _service, bytes32 _username, bytes32 _password) public {
        passwords[_service] = Password(_service, _username, _password);
    }

    function deletePassword(string memory _service) public {
        delete passwords[_service];
        
        // Find the index of the service in the services array
        uint index = findServiceIndex(_service);
        
        // If the service was found, remove it from the array
        if (index < services.length) {
            services[index] = services[services.length - 1]; // Move the service to the last spot
            services.pop(); // Remove the last element
        }
    }

    function findServiceIndex(string memory _service) internal view returns (uint) {
        for (uint i = 0; i < services.length; i++) {
            if (keccak256(bytes(services[i])) == keccak256(bytes(_service))) {
                return i;
            }
        }
        return services.length; // Return a value outside the array bounds to indicate not found
    }
}