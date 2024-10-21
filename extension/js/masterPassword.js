document.addEventListener('DOMContentLoaded', function () {
    // Signup.html variables and buttons
    var name = document.getElementById("name");
    var email = document.getElementById("email");
    var masterPassword = document.getElementById("master-password");
    var confirmPassword = document.getElementById("confirm-password");
    var saveMaster = document.getElementById("saveMaster");

    //MasterPassword.html variables and buttons
    var enteredMaster = document.getElementById("enter-master-password");
    var authenticateMaster = document.getElementById("authenticateMaster");
  
    // Signup clicked    
    saveMaster.addEventListener('click', async function (event) {
        event.preventDefault();
        alert("booya");
        const nameValue = name.value;
        const emailValue = email.value;
        const masterPasswordValue = masterPassword.value;
        const confirmPasswordValue = confirmPassword.value;
    
        if (masterPasswordValue === confirmPasswordValue) {
            try {
                const response = await fetch('http://localhost:3000/registerUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                name: nameValue,
                email: emailValue,
                masterPassword: masterPasswordValue
                })
            });
    
            if (response.ok) {
                alert("User registered successfully");
            } else {
                alert("Error registering user");
            }
            } catch (error) {
            console.error('Error registering the user:', error);
            }
        } else {
            alert("Passwords do not match!");
        }
        });

    //Login clicked
    authenticateMaster.addEventListener('click', async function () {
        const enteredMasterValue = enteredMaster.value;
    
        try {
            const response = await fetch('http://localhost:3000/loginUser', {
                method: 'POST',
                headers: {
              'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: enteredMasterValue })
            });
    
            if (response.ok) {
                chrome.action.setPopup({popup: "savepassword.html"});
                chrome.action.openPopup();
            } else {
                const errorMessage = await response.text();
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again.');
        }

    });

});


