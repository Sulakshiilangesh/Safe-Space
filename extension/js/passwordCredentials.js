

// To do:
// Display credentials of current chrome tab at ViewPassword.html
// Ask for master password to show password
// Edit => EditPassword.html
// Display all credentials at PasswordTable.html

function generateStrongPassword() {
    const specialChars = "!@#$%^&*()_+[]{}|;:',.<>?";
    const digits = "0123456789";
    const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";

    const passwordLength = Math.floor(Math.random() * (18 - 12 + 1)) + 12;

    let specialCharCount = 0;
    let integerCount = 0;
    let uppercaseCount = 0;

    if (passwordLength === 12 || passwordLength === 13) {
        specialCharCount = Math.floor(Math.random() * (3 - 2 + 1)) + 2;
        integerCount = 2;
        uppercaseCount = 4;
    } else if (passwordLength === 14 || passwordLength === 15) {
        specialCharCount = Math.floor(Math.random() * (4 - 3 + 1)) + 3;
        integerCount = Math.floor(Math.random() * (3 - 2 + 1)) + 2;
        uppercaseCount = 4;
    } else if (passwordLength >= 16 && passwordLength <= 18) {
        specialCharCount = Math.floor(Math.random() * (5 - 4 + 1)) + 4;
        integerCount = 3;
        uppercaseCount = Math.floor(Math.random() * (5 - 4 + 1)) + 4;
    } else {
        specialCharCount = 2;
        integerCount = 2;
        uppercaseCount = 4;
    }

    const lowercaseCount = passwordLength - (specialCharCount + integerCount + uppercaseCount);

    function getRandomCharacters(count, characters) {
        let result = '';
        for (let i = 0; i < count; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    const password = getRandomCharacters(specialCharCount, specialChars) +
        getRandomCharacters(integerCount, digits) +
        getRandomCharacters(uppercaseCount, upperCaseLetters) +
        getRandomCharacters(lowercaseCount, lowerCaseLetters);

    const shuffledPassword = password.split('').sort(() => Math.random() - 0.5).join('');
    return shuffledPassword;
}


// Stores the Password Input Fields
var passwordField = null;
var confirmPasswordField = null;

function SuggestPassword() {
    passwordField.addEventListener('click', function() {
        if (passwordField === document.querySelector('input[type="password"]')) {
            if (passwordField.value == "") {
                var existingSuggestion = document.getElementById('suggestion');
                if (existingSuggestion) {
                    existingSuggestion.remove();
                }

                var passwordSuggestion = document.createElement('button');
                passwordSuggestion.id = 'suggestion';
                passwordSuggestion.style.marginLeft = '40px';
                passwordSuggestion.style.position = 'absolute';
                passwordSuggestion.style.padding = '20px';
                passwordSuggestion.style.backgroundColor = '#000000df';
                passwordSuggestion.style.borderRadius = '5px';
                passwordSuggestion.style.color = '#fff';
                passwordSuggestion.style.border = 'none';
                passwordSuggestion.style.width = 'fit-content';
                passwordSuggestion.style.fontFamily = 'consolas';

                const strongPassword = generateStrongPassword();
                passwordSuggestion.textContent = 'Password Suggestion: ' + strongPassword;

                var brandingText = document.createElement('div');
                brandingText.textContent = 'SAFE-SPACE';
                brandingText.style.marginTop = '15px';
                brandingText.style.fontSize = '10px';
                brandingText.style.color = '#888888';
                brandingText.style.textAlign = 'right';
                passwordSuggestion.appendChild(brandingText);

                var rect = passwordField.getBoundingClientRect();
                passwordSuggestion.style.left = rect.left + window.scrollX + 'px';
                passwordSuggestion.style.top = rect.bottom + window.scrollY + 'px';

                document.body.appendChild(passwordSuggestion);

                passwordSuggestion.addEventListener('click', function() {
                    passwordField.value = strongPassword;
                    passwordSuggestion.remove(); 
                    confirmPasswordField.value = strongPassword;
                });
                
                // Remove button if clicked elsewhere
                document.addEventListener('click', function(event) {
                    if (event.target !== passwordSuggestion && event.target !== passwordField) {
                    passwordSuggestion.remove();
                    }
                });
            }
        }
    });
}

// Function to prompt the user for the master password and authenticate
async function authenticateUser() {
    const masterPassword = prompt("Enter your master password to authenticate:");

    if (!masterPassword) {
        throw new Error("Authentication cancelled or password not provided.");
    }

    try {
        const response = await fetch('http://localhost:3000/loginUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: masterPassword }),
        });

        if (!response.ok) {
            throw new Error('Authentication failed: Invalid password.');
        }

        console.log("User authenticated successfully.");
        return true;  // Return true if authenticated successfully
    } catch (error) {
        console.error('Error during authentication:', error.message);
        return false;  // Return false if authentication failed
    }
}


function AutofillToSave() {
    // Get Login credentials from loginform and display it autofilled in SavePasssword.html\
    if (event.target.tagName === 'FORM') {
        var username = event.target.querySelector('input[type="text"], input[name="username"]').value;
        var password = event.target.querySelector('input[type="password"]').value;
        var url = window.location.hostname;
        alert(username);
        alert(password);
        alert(url);

        // Send the captured username and password to the background script
        chrome.runtime.sendMessage({
            action: 'captureLogin',
            username: username,
            password: password,
            url: url
        });
    }
}

function saveCredentials() {
    document.addEventListener('DOMContentLoaded', function () {
        var website = document.getElementById('website');
        var username = document.getElementById('username');
        var servicePassword = document.getElementById('servicePassword');
        var saveButton = document.getElementById('saveButton');

        saveButton.addEventListener('click', async function (event) {
            const websiteValue = website.value;
            const usernameValue = username.value;
            const servicePasswordValue = servicePassword.value;

            const isAuthenticated = await authenticateUser();
            if (!isAuthenticated) {
                alert('Authentication failed. Cannot save credentials.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                service: websiteValue,
                username: usernameValue,
                servicePassword: servicePasswordValue
                })
            });
    
            if (response.ok) {
                alert("Password Added Successfully!");
            } else {
                alert("Error adding password");
            }
            } catch (error) {
            console.error('Error adding password:', error);
            }
        })
    });
}

async function autofillCredentialsIfFound(service) {
    try {
        const response = await fetch(`http://localhost:3000/password?service=${service}`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('No saved credentials found');
        }

        const data = await response.json();
        // Autofill the credentials in the form
        const usernameField = document.querySelector('input[type="text"], input[name="username"]');
        const passwordField = document.querySelector('input[type="password"]');

        if (usernameField && passwordField) {
            usernameField.value = data.username;
            passwordField.value = data.password;
            console.log('Credentials autofilled');
        }
    } catch (error) {
        console.log('No credentials found for this service:', error.message);
    }
}

// For every current Chrome tab
function pageLoad() {
    var inputs = document.getElementsByTagName("input");
    var service = window.location.hostname;
    var passwordFound = false;
    var invalidInputs = 0; // includes input type: hidden, submit, reset, button
    var validInputs = 0; // everything else

    // Distinguish Login and Signup forms
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type === "password" && inputs[i].disabled === false && inputs[i].hidden === false) {
            if (!passwordFound) {
                passwordField = inputs[i];
                passwordFound = true;
            } else {
                confirmPasswordField = inputs[i];
            }
        }
        if (inputs[i].type === "hidden" || inputs[i].type === "submit" || inputs[i].type === "reset" || inputs[i].type === "button" || inputs[i].hidden === true || inputs[i].disabled === true) {
            invalidInputs++;
        }
    }
    validInputs = inputs.length - invalidInputs;

    if (passwordFound && validInputs <= 2) {
        // Login form detected
        alert("Login Page Detected!");

        // Autofill credentials if they are found for this service
        autofillCredentialsIfFound(service);

        document.addEventListener('submit', (event) => {
            AutofillToSave();
        });
    }
    else if (passwordFound) {
        // signup forms
        SuggestPassword();
        document.addEventListener('submit', (event) => {
            AutofillToSave();
        });

    }  
};

pageLoad();