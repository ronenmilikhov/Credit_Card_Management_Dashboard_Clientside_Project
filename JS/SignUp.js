let listOfUsers = JSON.parse(localStorage.getItem("listOfUsers")) || []; 
// Format the credit card number with "-" every 4 digits (regex)
document.getElementById("cardNumber").addEventListener("input", function(event) 
{
    let input = event.target.value.replace(/\D/g, '');  // ** Remove non-numeric characters
    input = input.replace(/(\d{4})(?=\d)/g, '$1-'); // ** Insert hyphen every 4 digits
    event.target.value = input; // Update the input field
});

// Format the expiration date with a slash after 2 digits (MM/YY) (regex)
document.getElementById("expirationDate").addEventListener("input", function(event) 
{
    let input = event.target.value.replace(/\D/g, '');  // ** Remove non-numeric characters
    input = input.replace(/(\d{2})(?=\d)/g, '$1/'); // ** Insert slash after 2 digits
    event.target.value = input; // ** Update the input field
});

function verifyRegister() 
{
    let emailValid = true; // Initializing a boolean variable to check for email validation (to see if it already exists)
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let dob = document.getElementById("dob").value;
    let cardNumber = document.getElementById("cardNumber").value;
    let expirationDate = document.getElementById("expirationDate").value;

    // Regular expression for email format
    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Regular expression for password (8 chars, at least one uppercase, one lowercase, one number, and only one special character)
    let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=^[^!@#$%^&*]*[!@#$%^&*][^!@#$%^&*]*$)[A-Za-z\d!@#$%^&*]{8}$/;

    // Regular expression for credit card number (4 sets of 4 digits)
    let cardNumberPattern = /^(?:\d{4}[- ]?){3}\d{4}$/;

    // Regular expression for credit card expiration date (MM/YY format)
    let expirationDatePattern = /^(0[1-9]|1[0-2])\/\d{2}$/;

    // Calculate age based on date of birth and ensure the user is over 16
    let dobDate = new Date(dob); // dob is the date of birth input
    let currentDate = new Date(); // Get current date
    let age = currentDate.getFullYear() - dobDate.getFullYear();

    // Calculate the difference in months and days to adjust the age if the birthday hasn't occurred yet this year
    let monthDiff = currentDate.getMonth() - dobDate.getMonth();
    let dayDiff = currentDate.getDate() - dobDate.getDate();

    // If the current month is before the birth month, or it's the birth month but the current day is before the birth day
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) 
    {
        age--; // Subtract 1 from the age if the birthday hasn't occurred yet this year
    }

    // Get error elements
    let emailError = document.getElementById("emailError");
    let emailFormatError = document.getElementById("emailFormatError");
    let emailNotValid = document.getElementById("emailNotValid");
    let passwordError = document.getElementById("passwordError");
    let passwordFormatError = document.getElementById("passwordFormatError");
    let dobError = document.getElementById("dobError");
    let cardNumberError = document.getElementById("cardNumberError");
    let expirationDateError = document.getElementById("expirationDateError");

    // Hide error messages by default
    emailError.classList.add("hidden");
    emailFormatError.classList.add("hidden");
    emailNotValid.classList.add("hidden");
    passwordError.classList.add("hidden");
    passwordFormatError.classList.add("hidden");
    dobError.classList.add("hidden");
    cardNumberError.classList.add("hidden");
    expirationDateError.classList.add("hidden");

    // Validate email
    if (!email) 
    {
        //Display the error message for the email if input is empty
        emailError.classList.remove("hidden");
    } 
    else if (!emailPattern.test(email)) 
    {
        //Display the error message for the email if the input isn't matching the pattern
        emailFormatError.classList.remove("hidden");
    }
    else
    {   
        //Looping through the users in listOfUsers array
        for(user of listOfUsers)
        {
            //Checking if the email in the input matches an existing email in the listOfUsers array
            if(user["email"] === email)
            {
                emailValid = false; //This will become false if the email was found in the listOfUsers array
            }
        }
        if(!emailValid)
        {
            //Displays the message that email already exists
            emailNotValid.classList.remove("hidden");
        } 
    }
                

    // Validate password
    if (!password) 
    {
        //Display the error message for the password if the input is empty
        passwordError.classList.remove("hidden");
    } 
    else if (!passwordPattern.test(password)) 
    {
        //Display the error message for the password if the input isn't matching the pattern
        passwordFormatError.classList.remove("hidden");
    }

    // Validate date of birth (age over 16)
    if (!dob || age < 16) 
    {
        //Display the error message for the date of birth if the input is empty or age is less than 16
        dobError.classList.remove("hidden");
    }

    // Validate credit card number
    if (!cardNumber || !cardNumberPattern.test(cardNumber)) 
    {
        //Display the error message for the credit card if the input is empty or doesn't match the pattern
        cardNumberError.classList.remove("hidden");
    }

    // Validate expiration date
    let expirationParts = expirationDate.split('/'); //Splitting the card number by '/'
    let expirationMonth = parseInt(expirationParts[0]); //Getting the first part from the split
    let expirationYear = parseInt('20' + expirationParts[1]); // Assuming input is in MM/YY format

    // Check if expiration month and year are greater than or equal to the current date
    if (!expirationDate || !expirationDatePattern.test(expirationDate) || 
        expirationYear < currentDate.getFullYear() || 
        (expirationYear === currentDate.getFullYear() && expirationMonth <= currentDate.getMonth() + 1)) 
        {
            expirationDateError.classList.remove("hidden");
        }

    // If all validations pass, show success message, and add user to "listOfUsers"
    if (emailPattern.test(email) && passwordPattern.test(password) && age >= 16 &&
        cardNumberPattern.test(cardNumber) && expirationDatePattern.test(expirationDate) &&
        (expirationYear > currentDate.getFullYear() || 
        (expirationYear === currentDate.getFullYear() && expirationMonth > currentDate.getMonth() + 1))
        && emailValid)
        {
            let cardNumbers = []; //Initializing an empty array for the user's credit cards
            cardNumbers.push(cardNumber); //Pushing the new credit card into the array
            let expirationDates = []; //Initializing an empty array for the user's credit cards expiration dates
            expirationDates.push(expirationDate); //Pushing the expiration date for the new credit card into the array

            // Creating the user object and assigning the info to his attributes
            let user = 
            {
                email: email,
                password: password,
                dateOfBirth: dob,
                cardNumbers: cardNumbers,
                expirationDates: expirationDates,
            };

            listOfUsers.push(user); //Pushing the new created user into the listOfUsers array
            localStorage.setItem("listOfUsers", JSON.stringify(listOfUsers)); //Saving the listOfUsers in the localStorage as JSON formatted string
            
            // Now we will display the message that indicates the successful registration
            let successDialog = document.querySelector("#successDialog");
            successDialog.showModal();
            setTimeout(passingUserToLoginPage, 2500); // Moving the user to the login screen after 2.5 seconds
        }
}

function passingUserToLoginPage() //The function used to pass the user to the login page
{
    window.location.href = "Login.html";
}