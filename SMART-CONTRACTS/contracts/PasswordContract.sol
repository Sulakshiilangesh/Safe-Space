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

    event PasswordAdded(string service);
    event PasswordUpdated(string service);
    event PasswordDeleted(string service);

    function addPassword(string memory _service, bytes32 _username, bytes32 _password) public {
        require(bytes(_service).length > 0, "Service name cannot be empty");
        require(passwords[_service].username == bytes32(0), "Service already exists");

        passwords[_service] = Password(_service, _username, _password);
        services.push(_service);

        emit PasswordAdded(_service);
    }

    function getPassword(string memory _service) public view returns (Password memory) {
        require(bytes(_service).length > 0, "Service name cannot be empty");
        require(passwords[_service].username != bytes32(0), "Service does not exist");

        return passwords[_service];
    }

    function editPassword(string memory _service, bytes32 _username, bytes32 _password) public {
        require(bytes(_service).length > 0, "Service name cannot be empty");
        require(passwords[_service].username != bytes32(0), "Service does not exist");

        passwords[_service] = Password(_service, _username, _password);

        emit PasswordUpdated(_service);
    }

    function deletePassword(string memory _service) public {
        require(bytes(_service).length > 0, "Service name cannot be empty");
        require(passwords[_service].username != bytes32(0), "Service does not exist");

        delete passwords[_service];
        removeService(_service);

        emit PasswordDeleted(_service);
    }

    function getAllPasswords() public view returns (Password[] memory) {
        Password[] memory allPasswords = new Password[](services.length);
        for (uint i = 0; i < services.length; i++) {
            allPasswords[i] = passwords[services[i]];
        }
        return allPasswords;
    }

    function removeService(string memory _service) internal {
        uint index = findServiceIndex(_service);
        if (index < services.length) {
            services[index] = services[services.length - 1];
            services.pop();
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