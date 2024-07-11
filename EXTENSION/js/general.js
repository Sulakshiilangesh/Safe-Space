// Exit
document.getElementById('close-button').addEventListener('click', function() {
    window.close();
});

// Make Passwords Visible for 2 seconds
document.getElementById('show-password').addEventListener('click', function() {
    const passwordField = document.getElementById('password');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        setTimeout(() => {
            passwordField.type = 'password';
        }, 2000);
    }
});