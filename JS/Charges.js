// Getting all the necessary data, such as the list of users and the list of expenses for future use
let listOfUsers = JSON.parse(localStorage.getItem("listOfUsers"));
let listOfExpenses = JSON.parse(localStorage.getItem("listOfExpenses")) || {};
// Getting the email and card number from the query string for future use
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let email = urlParams.get('email');
let cardNumber = urlParams.get('cardNumber');

function Disconnect() 
{
    let successDialog = document.querySelector("#successDialog");
    successDialog.showModal();
    setTimeout(passingUserToLoginPage, 2500);
}

function passingUserToLoginPage() 
{
    window.location.href = "Login.html";
}

function passingUserToDashboard() 
{
    window.location.href = `Dashboard.html?email=${email}`;
}

function passingUserToActions() 
{
    window.location.href = `Actions.html?email=${email}`;
}

// Get the current month and year from the full current date for future use
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth(); // 0-indexed (January is 0)
let monthSelect = document.getElementById("month-select"); // Getting the dropdown months element

// Populate dropdown with months from January 2024 to the current month in descending order
for (let year = currentYear; year >= 2024; year--) 
{
    // Array of month names
    let monthsArray = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let startMonth = year === currentYear ? currentMonth : 11; // Current month for the current year or December for earlier years
    let endMonth = 0; // For all years, the "endMonth" will always be January (0)
    for (let month = startMonth; month >= endMonth; month--) 
    { // Append all the months to the dropdown list
        let option = document.createElement("option");
        option.value = `${year}-${month + 1}`; // e.g., "2024-1" for January 2024 (month + 1 because startMonth is zero-indexed)
        option.textContent = `${monthsArray[month]} ${year}`;
        monthSelect.appendChild(option);
    }
}

// When you load the page for the first time, it will present the info for the default chosen month
window.addEventListener("load", function() 
{
    // Trigger the "change" event for the default selection
    let event = new Event("change"); // Creating new event listener "change"
    monthSelect.dispatchEvent(event); // Executing the "change" event when the page loaded on monthSelect
});

// Close the dropdown when the mouse leaves the area
monthSelect.addEventListener("mouseleave", () => 
{
    monthSelect.blur(); // Removes focus, which closes the dropdown
});

// Sums the transactions for the chosen month and displays the total charges for that month
monthSelect.addEventListener("change", function(event) 
{
    // Summing up the transactions for the chosen month (isCurrentMonth receives "false" by default if no boolean parameter is passed)
    function getMonthlyTotal(month, year, isCurrentMonth = false) 
    {
        let total = 0;
        // Initialize transactionsForMonth only when calculating for the current month
        if (isCurrentMonth) transactionsForMonth = [];

        for (let key in listOfExpenses)
        {
            if (key === cardNumber) 
            {
                for (let transaction of listOfExpenses[cardNumber]) 
                {
                    let transactionDate = transaction["Date"].split("/");
                    if (parseInt(transactionDate[1]) === month && parseInt(transactionDate[2]) === year) 
                    {
                        total += parseFloat(transaction["Amount"]);
                        if (isCurrentMonth) 
                        {
                            transactionsForMonth.push(transaction); // Populate only for the current month
                        }
                    }
                }
                break;
            }
        }
        return total;
    }

    // Adjust months for when calculating previous 2 months (used for when in January month)
    function adjustMonthAndYear(month, year) 
    {
        if (month < 1) 
        {
            month += 12;
            year -= 1;
        }
        return { month, year }; // Returns an object with "month" and "year" keys, and attach values to them
    }

    let chosenMonth = parseInt(event.target.value.split("-")[1]); // Getting the month (not zero indexed)
    let chosenYear = parseInt(event.target.value.split("-")[0]); // Getting the year

    // Ensure valid sum for the current month (passing True because we are in the current month)
    let currentMonthSum = getMonthlyTotal(chosenMonth, chosenYear, true);
    // Getting the div element under the dropdown list
    let sumAndChartDiv = document.getElementById("sum-and-chart");
    // Clear previous content
    sumAndChartDiv.innerHTML = "";

    // Add total charges text (if 0 don't present anything)
    if (currentMonthSum) 
    {
        let totalText = document.createElement("p");
        totalText.textContent = `Total charges for card ${cardNumber} in ${event.target.options[event.target.selectedIndex].text} is: ₪${currentMonthSum.toFixed(2)}`;
        sumAndChartDiv.appendChild(totalText);

        // Create and populate the table
        let table = document.createElement("table");
        table.classList.add("transaction-table");

        // Add table headers
        let thead = document.createElement("thead");
        let headerRow = document.createElement("tr");

        let headers = ["Date", "Business Name", "Category", "Amount"];
        for (let i = 0; i < headers.length; i++) 
        { // Iterates over the headers names and add their names to the header row
            let th = document.createElement("th");
            th.textContent = headers[i];
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Add table rows with the transactions for the chosen month
        let tbody = document.createElement("tbody");
        for (let i = 0; i < transactionsForMonth.length; i++) 
        {
            let row = document.createElement("tr");
            let transaction = transactionsForMonth[i];
            
            for (let j = 0; j < headers.length; j++) 
            {
                let td = document.createElement("td");
                td.textContent = transaction[headers[j]];
                row.appendChild(td);
            }
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        // Append the table to the div
        sumAndChartDiv.appendChild(table);
    } 
    else // No transactions for the current month
    {
        let noTransactionsText = document.createElement("p");
        noTransactionsText.textContent = `There are no transactions for card ${cardNumber} in ${event.target.options[event.target.selectedIndex].text}.`;
        sumAndChartDiv.appendChild(noTransactionsText);
    }

    // Calculating the charges for the last 2 previous months
    let lastMonthData = adjustMonthAndYear(chosenMonth - 1, chosenYear);
    let lastMonthSum = getMonthlyTotal(lastMonthData.month, lastMonthData.year); // Returns the sum only

    let twoMonthsAgoData = adjustMonthAndYear(chosenMonth - 2, chosenYear);
    let twoMonthsAgoSum = getMonthlyTotal(twoMonthsAgoData.month, twoMonthsAgoData.year); // Returns the sum only

    // Creating the graphs div
    let graphsDiv = document.getElementById("graphs");
    // Reset when choosing different month
    graphsDiv.innerHTML = "";

    // Creating the canvas elements
    let barChartCanvas = document.createElement("canvas");
    let pieChartCanvas = document.createElement("canvas");
    graphsDiv.appendChild(barChartCanvas);
    graphsDiv.appendChild(pieChartCanvas);

    new Chart(barChartCanvas, 
    {
        type: "bar",
        data: 
        {
            labels: [ // X axis labels
                `${twoMonthsAgoData.month}/${twoMonthsAgoData.year}`,
                `${lastMonthData.month}/${lastMonthData.year}`,
                `${chosenMonth}/${chosenYear}`
            ],
            datasets: [ // the sums
                {
                    data: [twoMonthsAgoSum, lastMonthSum, currentMonthSum],
                    backgroundColor: ["#81C784", "#4CAF50", "#388E3C"]
                }
            ]
        },
        options:
        {
            plugins: 
            {
                legend: { display: false }, // Hiding the legend
                tooltip: // Adds the ₪ when hovering over the bars
                {
                    callbacks: { label: (context) => `₪${context.raw.toLocaleString()}` } 
                },
                title:
                {
                    display: true,
                    text: "Current and last two months total charges",
                    font: 
                    {
                        size: 16 // Optional: Customize font size
                    },
                },
            },
            scales: 
            {
                y: { beginAtZero: true } // Y axis starts from 0
            }
        }
    });

    // Getting the categories for each transactions of the current month
    let categories = {};
    for (let transaction of transactionsForMonth) 
    {
        let category = transaction["Category"];
        let amount = parseFloat(transaction["Amount"]);
        // calculate the total amount for each category and store it in the categories object
        categories[category] = (categories[category] || 0) + amount;
    }

    new Chart(pieChartCanvas, 
    {
        type: "pie",
        data: 
        {
            labels: Object.keys(categories),
            datasets: [
                {
                    data: Object.values(categories),
                }
            ]
        },
        options: 
        {
            plugins: 
            {
                legend: { position: "bottom" },
                tooltip: { callbacks: { label: (context) => `${context.label}: ₪${context.raw.toLocaleString()}` } },
                title: 
                {
                    display: true,
                    text: "Current month's total charges divided by categories",
                    font: { size: 16 },
                }
            }
        }
    });
});