// Exit
const close = document.getElementById('close-button');
if (close) {
    close.addEventListener('click', function() {
        window.close();
    });
};

// Show Password for 0.5 seconds
const showButtons = document.querySelectorAll('.show-password');
showButtons.forEach(button => {
    button.addEventListener('click', function() {
        let previousSibling = button.previousElementSibling;
        while (previousSibling.tagName !== 'INPUT') {
            previousSibling = previousSibling.previousElementSibling;
        }
        const passwordField = previousSibling;
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            setTimeout(() => {
                passwordField.type = 'password';
            }, 500);
        }
    });
});

// Copy Password
const copy_password = document.getElementById('copy-password');
var password = document.getElementById('password');
if (copy_password) {
    copy_password.addEventListener('click', function() {   
        document.getElementById("password-tooltip").style.display = "block"; 
        navigator.clipboard.writeText(password.value);
        setTimeout(() => {
            document.getElementById("password-tooltip").style.display = "none";
        }, 1000);
    });
};

// Copy Username
const copy_username = document.getElementById('copy-username');
var username = document.getElementById('username');
if (copy_username) {
    copy_username.addEventListener('click', function() {
        document.getElementById("username-tooltip").style.display = "block"; 
        navigator.clipboard.writeText(username.value);
        setTimeout(() => {
            document.getElementById("username-tooltip").style.display = "none";
        }, 1000);
    });
};

// 