// Getting the list of the users as JS array of objects for future use
let listOfUsers = JSON.parse(localStorage.getItem("listOfUsers"));
// Getting the list of the expenses of credit cards for future use, might be empty
let listOfExpenses = JSON.parse(localStorage.getItem("listOfExpenses")) || {};
// Getting the email from the query string for future use
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let email = urlParams.get('email');
let dropdown = document.getElementById("creditcard-select"); // Getting the credit card select element for future use

// Iterating over each user and finding the corresponding user in the listOfUsers and adding his existing credit cards to the dropdown list
for(user of listOfUsers)
{
    if(user["email"] === email)
    {
        for(let i = 0; i < user["cardNumbers"].length; i++)
        {
            let option = document.createElement("option");
            option.value = user["cardNumbers"][i];
            option.textContent = `${user["cardNumbers"][i]}`;
            dropdown.appendChild(option);
        }
    }
}

// Close the opened dropdown when the mouse leaves the area
dropdown.addEventListener("mouseleave", () => {
    dropdown.blur(); // Removes focus, which closes the dropdown
});

function Disconnect()
{
    let successDialog = document.querySelector("#successDialog");
    successDialog.showModal();
    setTimeout(passingUserToLoginPage, 2500);
}

function addCreditCardDialog()
{
    let addingCard = document.querySelector("#addingCard");
    addingCard.showModal();
}

function CloseDialog() // When closing the "Add Card" dialog
{
    let closingDialog = document.getElementById("addingCard");
    let cardNumber = document.getElementById("cardNumber").value = ""; 
    let expirationDate = document.getElementById("expirationDate").value = "";
    closingDialog.close();
}

function passingUserToLoginPage()
{
    // Making sure the file uploaded to the localStorage is deleted when moving between pages
    localStorage.removeItem("fromFile");
    document.getElementById("file").value = ""; // Reset the file input field
    window.location.href = "Login.html";
}

function passingUserToDashboard()
{
    // Making sure the file uploaded to the localStorage is deleted when moving between pages
    localStorage.removeItem("fromFile");
    document.getElementById("file").value = ""; // Reset the file input field
    window.location.href = `Dashboard.html?email=${email}`;
}

function passingUserToActions()
{
    // Making sure the file uploaded to the localStorage is deleted when moving between pages
    localStorage.removeItem("fromFile");
    document.getElementById("file").value = ""; // Reset the file input field
    window.location.href = `Actions.html?email=${email}`;
}

function addCreditCard()
{
    // Getting all the required details for adding the new credit card from the inputs
    let cardNumber = document.getElementById("cardNumber").value;
    let expirationDate = document.getElementById("expirationDate").value;
    // Getting all the error messages elements
    let cardNumberError = document.getElementById("cardNumberError");
    let expirationDateError = document.getElementById("expirationDateError");
    let cardNumberAlreadyExists = document.getElementById("cardNumberAlreadyExists");
    // Getting the current date for future use and setting up a flag to indicate if the new credit card doesn't already exist
    let currentDate = new Date();
    let cardValid = true; 

    let cardNumberPattern = /^(?:\d{4}[- ]?){3}\d{4}$/; // Regex for the card number
    let expirationDatePattern = /^(0[1-9]|1[0-2])\/\d{2}$/; // Regex for the card expiration date

    // By default hiding the error messages
    cardNumberError.classList.add("hidden");
    expirationDateError.classList.add("hidden");
    cardNumberAlreadyExists.classList.add("hidden");

    // Checking if the credit card number input is not empty or the input doesn't match the regex pattern
    if (!cardNumber || !cardNumberPattern.test(cardNumber)) 
    {
        cardNumberError.classList.remove("hidden");
    }

    // Validate expiration date, extracting them for future use
    let expirationParts = expirationDate.split('/');
    let expirationMonth = parseInt(expirationParts[0]);
    let expirationYear = parseInt('20' + expirationParts[1]); // Assuming input is in MM/YY format

    // Check if expiration month and year are greater than or equal to the current date and checking if the expiration date matches the pattern
    if (!expirationDate || !expirationDatePattern.test(expirationDate) || 
    expirationYear < currentDate.getFullYear() || 
    (expirationYear === currentDate.getFullYear() && expirationMonth <= currentDate.getMonth() + 1)) 
    {
        expirationDateError.classList.remove("hidden");
    }

    // Iterating over users and finding the corresponding user in the listOfUsers and checking if the credit card already exists and displays an error message if needed
    for(let user of listOfUsers)
    {
        if(user["email"] === email)
        {
            for(let i = 0; i < user["cardNumbers"].length; i++)
            {
                if(user["cardNumbers"][i] === cardNumber)
                {
                    cardValid = false; // Card exists so we must display the error message and exit the loop
                    cardNumberAlreadyExists.classList.remove("hidden");
                    break;
                }
            }
            if(!cardValid) break;
        }
    }

    // So if the credit card is valid from all perspectives, we can add the new credit card to the user
    if (cardNumberPattern.test(cardNumber) && expirationDatePattern.test(expirationDate) &&
    (expirationYear > currentDate.getFullYear() || 
    (expirationYear === currentDate.getFullYear() && expirationMonth > currentDate.getMonth() + 1))
    && cardValid)
    {
        for(let user of listOfUsers)
        {
            if(user["email"] === email)
            {
                user["cardNumbers"].push(cardNumber);
                user["expirationDates"].push(expirationDate);
                // Adding the new credit card immediately to the dropdown list in this page
                let option = document.createElement("option");
                option.value = cardNumber;
                option.textContent = `${cardNumber}`;
                dropdown.appendChild(option);
                break;
            }
        }
        localStorage.setItem("listOfUsers", JSON.stringify(listOfUsers)); // Update the local storage with the user and his new credit card
        // Displaying a message that the card was added successfully
        let addedCardDialog = document.querySelector("#cardAdded");
        addedCardDialog.showModal();
        setTimeout(() => addedCardDialog.close(), 2500);
    }
}

// Format the credit card number with "-" every 4 digits for when adding a new credit card
document.getElementById("cardNumber").addEventListener("input", function(event) 
{
    let input = event.target.value.replace(/\D/g, '');  // ** Remove non-numeric characters
    input = input.replace(/(\d{4})(?=\d)/g, '$1-'); // ** Insert hyphen every 4 digits
    event.target.value = input; // Update the input field
});

// Format the expiration date with a slash after 2 digits (MM/YY) for when adding a new credit card
document.getElementById("expirationDate").addEventListener("input", function(event) 
{
    let input = event.target.value.replace(/\D/g, '');  // ** Remove non-numeric characters
    input = input.replace(/(\d{2})(?=\d)/g, '$1/'); // ** Insert slash after 2 digits
    event.target.value = input; // ** Update the input field
});

// Adding an event listener for when the file changes it reads the file as a text string and saves it in the localStorage (shown in the ex docs)
document.getElementById("file").addEventListener("change", function(event)
{
    let file = event.target.files[0];
    if(file)
    {
        let reader = new FileReader();
        reader.onload = function(e)
        {
            let csvText = e.target.result;
            let json = csvToJson(csvText);
            localStorage.setItem("fromFile", JSON.stringify(json));
        };
        reader.readAsText(file);
    }
});

// The function for converting the CSV file format to JSON format and returns the value back to the action listener above (shown in the ex docs)
function csvToJson(csvText) 
{
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const jsonArray = lines.slice(1).map(line => 
    {
        const values = line.split(',').map(value => value.trim());
        const jsonObject = {};
        headers.forEach((header, index) => 
        {
            jsonObject[header] = values[index];
        });
        return jsonObject;
    });
    return jsonArray;
}

function loadTransactionsToCard() // Function for loading the transactions from a file to a credit card that was chosen
{
    // Getting the card number and the expenses 
    let cardNumber = document.getElementById("creditcard-select").value;
    let expenses = JSON.parse(localStorage.getItem("fromFile"));
    let cardFound = false; // Boolean for breaking the loop if the card found
    // Getting the error element
    let fileError = document.getElementById("fileError");

    fileError.classList.add("hidden"); // Hiding the error by default

    // if the user clicks on load transactions button, it will display error message
    if(!expenses)
    {
        fileError.classList.remove("hidden");
        return;
    }

    // Add transactions to the appropriate credit card
    for (let user of listOfUsers) 
    {
        if (user["email"] === email) 
        {
            for (let i = 0; i < user["cardNumbers"].length; i++) 
            {
                if (user["cardNumbers"][i] === cardNumber) 
                {
                    if(!listOfExpenses[user["cardNumbers"][i]])
                    {
                        // Initializes a new key (credit card) and its value is an array in the listOfExpenses object representing the expenses for the credit card
                        listOfExpenses[user["cardNumbers"][i]] = [];
                    }
                    // Add transactions to the card's expense list
                    listOfExpenses[user["cardNumbers"][i]] = listOfExpenses[user["cardNumbers"][i]].concat(expenses);
                    cardFound = true; // Card was found
                    break;
                }
            }
            if(!cardFound) break; // Breaking the loop if the card was found
        }
    }
    
    // Save updated expenses to local storage
    localStorage.setItem("listOfExpenses", JSON.stringify(listOfExpenses));
    // Cleaning the file that was uploaded to the localStorage
    localStorage.removeItem("fromFile");
    document.getElementById("file").value = ""; // Reset the file input field
    // Displaying message that the file was loaded successfully
    let fileLoadedDialog = document.querySelector("#fileLoaded");
    fileLoadedDialog.showModal();
    setTimeout(() => fileLoadedDialog.close(), 2500);
}      