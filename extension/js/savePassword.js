document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['username', 'password', 'url'], (data) => {
        if (data.username && data.password && data.url) {
            document.getElementById('username').value = data.username;
            document.getElementById('password').value = data.password;
            document.getElementById('website').value = data.url;
        }
    });

    // Add event listener for saving the password
    document.getElementById('saveButton').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const url = document.getElementById('website').value;

        

        // Save the credentials (for example, to blockchain, or however you're saving them)
        // Call your storage function here

        alert('Password saved successfully!');
    });
});
