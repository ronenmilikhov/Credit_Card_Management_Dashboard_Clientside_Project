// Getting the listOfUsers's values from the local storage, if it doesn't exist, create an empty array
let listOfUsers = JSON.parse(localStorage.getItem("listOfUsers")) || []; 

function verifyLogin() 
{
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    // Regular expression for email format (_%@_%._%)
    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Regular expression for password (8 chars, at least one uppercase, one lowercase, one number, and one special character)
    let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=^[^!@#$%^&*]*[!@#$%^&*][^!@#$%^&*]*$)[A-Za-z\d!@#$%^&*]{8}$/;

    // Getting the elements by their ID
    let emailError = document.getElementById("emailError");
    let emailFormatError = document.getElementById("emailFormatError");
    let passwordError = document.getElementById("passwordError");
    let passwordFormatError = document.getElementById("passwordFormatError");
    let emailOrPassNotFound = document.getElementById("emailOrPassNotFound");

    // Hiding error messages by default
    emailError.classList.add("hidden");
    emailFormatError.classList.add("hidden");
    passwordError.classList.add("hidden");
    passwordFormatError.classList.add("hidden");
    emailOrPassNotFound.classList.add("hidden");

    // Validate email
    if (!email) 
    {
        //Display error message for email if the input is empty
        emailError.classList.remove("hidden");
    } 

    else if (!emailPattern.test(email)) // Making sure the format of the email's value is valid
    {
        //Display error message for email if the input isn't matching the format (regex)
        emailFormatError.classList.remove("hidden");
    }

    // Validate password
    if (!password) 
    {
        //Display error message for password if the input is empty
        passwordError.classList.remove("hidden");
    } 

    else if (!passwordPattern.test(password)) // Making sure the format of the password's value is valid
    {
        passwordFormatError.classList.remove("hidden");
    }

    // If no errors, allow login (the email and password are matching to the ones existing in the listOfUsers)
    if (emailPattern.test(email) && passwordPattern.test(password)) 
    {
        let userFound = false; //Initialized a boolean to indicate if the user was found according to the input
        for(user of listOfUsers)
        {
            if(user["email"] === email && user["password"] === password)
            {
                // Greet the user for his connection, and tell him the exact Date and HH:MM he connected on
                let date = new Date(); // Getting the current date in the computer and creating a new object of it
                let currentDate = date.toLocaleDateString(); // Formats the object to string as a date (day/month/year)
                // Extract the time (hours and minutes) in a localized format
                let hoursAndMinutes = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
                // Adding the greeting text to the greeting paragraph

                let loginDate = 
                {
                    date: currentDate,
                    time: hoursAndMinutes
                };
                localStorage.setItem("loginDate", JSON.stringify(loginDate));

                let successDialog = document.querySelector("#successDialog");
                successDialog.showModal(); //Displaying message that login was successful
                userFound = true;
                setTimeout(passingUserToDashboardPage, 2500);
            }
        }
        if(!userFound)
        {
            emailOrPassNotFound.classList.remove("hidden");
        }   
    }

    function passingUserToDashboardPage()
    {
        window.location.href = `Dashboard.html?email=${email}`;
    }
}