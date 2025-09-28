// getting the JSON string of the loginDate from the localStorage and parsing it as JS object
let LoginDate = JSON.parse(localStorage.getItem("loginDate"));
if(LoginDate) // After the loginDate object was retrieved, we append the date to the paragraph
{
    let greetingParagraph = document.getElementById("greeting");
    greetingParagraph.textContent = `You connected on ${LoginDate["date"]} at
    ${LoginDate["time"]}`;
}

// Assuming listOfUsers, listOfExpenses and email are already defined and available
let listOfUsers = JSON.parse(localStorage.getItem("listOfUsers"));
let listOfExpenses = JSON.parse(localStorage.getItem("listOfExpenses")) || {};
// Getting the email from the queryString for future use
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let email = urlParams.get('email');

// Getting the current date
let today = new Date();

// Extracting the year, month, and day (using padStart for proper formatting)
let year = today.getFullYear();
let month = (today.getMonth() + 1).toString().padStart(2, "0");
let day = today.getDate().toString().padStart(2, "0");

// Combining into a formatted date
let formattedDate = `${month}-${day}`;

// Selecting the second nav div where the buttons are
let navSecondDiv = document.querySelector("nav > div:nth-child(2)");

// Creating the Dashboard for the user with all the info
for (let user of listOfUsers) 
{
    if (user["email"] === email) 
    {
        for (let i = 0; i < user["cardNumbers"].length; i++) 
        {
            // Create a new credit card container
            let creditCardDiv = document.createElement('div');
            creditCardDiv.className = 'credit-card';
            creditCardDiv.value = user["cardNumbers"][i]; // Assigning the value of the user's card number to the value of the creditCardDiv element for future use
            creditCardDiv.onclick = () => passingUserToCharges(creditCardDiv);
            
            // Add card title
            let titleSpan = document.createElement('span');
            titleSpan.textContent = `Credit Card ${i + 1}`;
            creditCardDiv.appendChild(titleSpan);

            // Add card details container
            let cardDetailsDiv = document.createElement('div');
            cardDetailsDiv.className = 'card-details';

            // Add card number
            let cardNumberSpan = document.createElement('span');
            cardNumberSpan.className = 'card-number';
            cardNumberSpan.textContent = "•••• •••• •••• " + user["cardNumbers"][i].split("-")[3];
            cardDetailsDiv.appendChild(cardNumberSpan);

            // Add expiration date
            let expiryDateSpan = document.createElement('span');
            expiryDateSpan.className = 'expiry-date';
            expiryDateSpan.textContent = user["expirationDates"][i];
            cardDetailsDiv.appendChild(expiryDateSpan);

            // Append card details to credit card container
            creditCardDiv.appendChild(cardDetailsDiv);

            // Append credit card container to the card section
            let cardSection = document.querySelector('.card-section'); // The section where cards will be appended
            cardSection.appendChild(creditCardDiv);
        }

        let userBirthDate = user["dateOfBirth"]; // Assuming the user's birth date is stored in the format "YYYY-MM-DD"
        let userBirthday = userBirthDate.substring(5); // Extract "MM-DD" part of user's birthdate
        let todayFormatted = formattedDate; // Extract "MM-DD" part of today's date

        // Check if the birthday coupon was already used
        let hasUsedCoupon = user["hasUsedBirthdayCoupon"] || false;

        // Check if the today is the birthday
        if (userBirthday === todayFormatted && !hasUsedCoupon) 
        {
            // Create the birthday coupon button
            let birthdayCouponBtn = document.createElement("span");
            birthdayCouponBtn.innerHTML = "Claim Birthday Coupon";
            birthdayCouponBtn.className = "birthday-coupon-btn"; // Add a class for styling if needed

            // Add an event listener to claim the coupon
            birthdayCouponBtn.addEventListener("click", function () 
            {
                // Add 50 NIS credit to the user's first credit card
                let firstCard = user["cardNumbers"][0];
                if (!listOfExpenses[firstCard]) 
                {
                    listOfExpenses[firstCard] = [];
                }

                // Add a new transaction for the coupon
                listOfExpenses[firstCard].push(
                {
                    "Date": `${day}/${month}/${year}`,
                    "Business Name": "Coupon",
                    "Category": "Birthday Coupon",
                    "Amount": -50.0, // Negative amount indicates credit
                });

                // Mark the coupon as used
                user["hasUsedBirthdayCoupon"] = true;

                // Save updates to localStorage
                localStorage.setItem("listOfUsers", JSON.stringify(listOfUsers));
                localStorage.setItem("listOfExpenses", JSON.stringify(listOfExpenses));

                // Remove the button after use
                birthdayCouponBtn.remove();

                let couponDialog = document.getElementById("couponAdded");
                couponDialog.showModal();
                // Closing the dialog after 2.5 secs
                setTimeout(() => {
                    couponDialog.close();
                    passingUserToDashboard();
                }, 2500);
            });

            // Append the button to the navigation section
            navSecondDiv.appendChild(birthdayCouponBtn)
        }
        break;
    }
}

// Function to calculate the total charges for a given card, month, and year
function getMonthlyTotal(cardNumber, month, year) 
{
    let total = 0;
    if (listOfExpenses[cardNumber]) 
    {
        for (let transaction of listOfExpenses[cardNumber]) 
        {
            let transactionDate = transaction["Date"].split("/");
            if (parseInt(transactionDate[1]) === month && parseInt(transactionDate[2]) === year) 
            {
                total += parseFloat(transaction["Amount"]);
            }
        }
    }
    return total;
}

// Function to adjust month and year for out-of-bound months
function adjustMonthAndYear(month, year) 
{
    if (month == 1) 
    {
        month = 12;
        year -= 1;
    }
    return { month, year };
}

// Select the summary card
let summaryCardSection = document.querySelector(".summary-section");

// Get the current month and year
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth() + 1; // Add 1 because months are zero-indexed

// Show summaries (current month charges + last month charges) for the user's credit cards
for (let user of listOfUsers) 
{
    if (user["email"] === email) 
    {
        user["cardNumbers"].forEach((cardNumber, index) => // forEach syntax(function(element, index, array))
        {
            // Calculate current and previous month charges
            let currentMonthSum = getMonthlyTotal(cardNumber, currentMonth, currentYear); // currentMonth is not zero indexed
            let lastMonthData = adjustMonthAndYear(currentMonth, currentYear); // Checks if the previous month was in the last year
            // For example: January 2025 -> December 2024
            let lastMonthSum = getMonthlyTotal(cardNumber, lastMonthData.month, lastMonthData.year); //Returns an object with month and year keys

            // Create a container for the card's summary
            let cardSummaryDiv = document.createElement("div");
            cardSummaryDiv.className = "card-summary";

            // Add card title
            let cardTitle = document.createElement("h3");
            cardTitle.textContent = `Credit Card ${index + 1}`;
            cardSummaryDiv.appendChild(cardTitle);

            // Add current month charges
            let currentMonthParagraph = document.createElement("p");
            let currentMonthBold = document.createElement("b");
            currentMonthBold.textContent = "Current Month Charges: ";
            currentMonthParagraph.appendChild(currentMonthBold);
            currentMonthParagraph.append(`₪${currentMonthSum.toFixed(2)}`);
            cardSummaryDiv.appendChild(currentMonthParagraph);

            // Add previous month charges
            let lastMonthParagraph = document.createElement("p");
            let lastMonthBold = document.createElement("b");
            lastMonthBold.textContent = "Previous Month Charges: ";
            lastMonthParagraph.appendChild(lastMonthBold);
            lastMonthParagraph.append(`₪${lastMonthSum.toFixed(2)}`);
            cardSummaryDiv.appendChild(lastMonthParagraph);

            // Append the card summary to the summary card section
            summaryCardSection.appendChild(cardSummaryDiv);
        });
        break;
    }
}

// Trigger the recommendations fetch when the page loads
window.addEventListener("load", fetchAndDisplayRecommendations);

function fetchAndDisplayRecommendations() 
{
    // Iterate through all credit cards for the user
    listOfUsers.forEach(user => 
    {
        if (user["email"] === email) 
        {
            user["cardNumbers"].forEach(cardNumber => 
            {
                // Extract transactions for the given card number
                let transactions = listOfExpenses[cardNumber] || [];

                // Format the data to match the API requirements
                let formattedTransactions = transactions.map(transaction => (
                {
                    date: transaction["Date"].split("/").reverse().join("-"), // Convert DD/MM/YYYY to YYYY-MM-DD
                    "business name": transaction["Business Name"],
                    category: transaction["Category"],
                    amount: parseFloat(transaction["Amount"]),
                }));

                // API URL
                let apiUrl = "https://yael-ex-expenses-services-299199094731.me-west1.run.app/get-recommendations?lang=en&apiKay=afGre4Eerf223432AXE";

                // Send the data to the API
                fetch(apiUrl, 
                {
                    method: "POST", // Since we are sending data, use POST method
                    headers: 
                    {
                        "Content-Type": "application/json", // Content type is JSON
                    },
                    body: JSON.stringify({ formattedTransactions }) // Send the transactions array in the body
                })
                    .then(response => 
                    {
                        if (!response.ok) 
                        {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json(); // Assuming the API returns JSON
                    })
                    .then(data => 
                    {
                        console.log("Recommendations:", data);
                        displayRecommendations(data, cardNumber);
                    })
                    .catch(error => 
                    {
                        console.error("Error fetching recommendations:", error);
                    });
            });
        }
    });
}

function displayRecommendations(apiResponse, cardNumber) // apiResponse = data
{
    // Assuming the API response is in the form: { "recommendations": "<div>...</div>" }
    let recommendationsHtml = apiResponse["recommendations"];

    // Get the summary-section div
    let summarySection = document.querySelector(".summary-section");

    // Create a container for recommendations (if not already created)
    recommendationsDiv = document.createElement("div");
    recommendationsDiv.id = `recommendations-${cardNumber}`;
    summarySection.appendChild(recommendationsDiv);

    // Add a title above the recommendations
    let title = document.createElement("h3");
    title.textContent = `Recommendations for Card Ending in ${cardNumber.slice(-4)}`; // Slice From end 4 steps back
    recommendationsDiv.appendChild(title);

    // Adding the recommendation to the recommendations
    recommendationsDiv.innerHTML += recommendationsHtml;
}

function Disconnect() // When pressing on Sign Out button, it will disconnect the user
{
    let successDialog = document.getElementById("successDialog");
    successDialog.showModal();
    setTimeout(passingUserToLoginPage, 2500);
}

function passingUserToLoginPage()
{
    window.location.href = "Login.html";
}

function passingUserToCharges(creditCardDiv)
{
    window.location.href = `Charges.html?email=${email}&cardNumber=${creditCardDiv.value}`;
}

function passingUserToDashboard()
{
    window.location.href = `Dashboard.html?email=${email}`;
}

function passingUserToActions()
{
    window.location.href = `Actions.html?email=${email}`;
}