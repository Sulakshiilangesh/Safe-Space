

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

function AutoFillCredentials() { 
    // retrieve credentials using current tab url
    // Decrypt Password
    // Autofill into login form
}

function SavePassword() {
    // Get Login credentials from loginform and display it autofilled in SavePasssword.html\
    if (event.target.tagName === 'FORM') {
        var username = event.target.querySelector('input[type="text"], input[name="username"]').value;
        var password = event.target.querySelector('input[type="password"]').value;
        var url = window.location.href;
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
    // Encrypt Password

    // Save to Blockchain
}

function checkForCredentials() {
    
}

// For every current Chrome tab
function pageLoad() {
    var inputs = document.getElementsByTagName("input");
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
        // login forms
        alert("Login Page Detected!");
        document.addEventListener('submit', (event) => {
            SavePassword();
        });
        // when submit is clicked checkForCredentials()
    } 
    else if (passwordFound) {
        // signup forms
        SuggestPassword();
        // when submit is clicked savePassword()
    }  
};

pageLoad();