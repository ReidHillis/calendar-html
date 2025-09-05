// Set all needed variables
const currentMonth = document.getElementById("currentMonth");
const calendarBody = document.getElementById("calendarBody");
const previousMonthButton = document.getElementById("previousMonth");
const nextMonthButton = document.getElementById("nextMonth");

const modal = document.getElementById("eventModal");
const modalDate = document.getElementById("modalDate");
const eventList = document.getElementById("eventList");

const eventNameInput = document.getElementById("eventName");
const eventDetailsInput = document.getElementById("eventDetails");
const eventHourSelect = document.getElementById("eventHour");
const eventMinuteSelect = document.getElementById("eventMinute");
const eventPeriodSelect = document.getElementById("eventPeriod");

const saveEventButton = document.getElementById("saveEvent");
const closeButton = document.querySelector(".close-button");

// Current date for calendar display
let currentDate = new Date();

// Retrieve events from localStorage or initialize an empty object
let events = JSON.parse(localStorage.getItem("events")) || {};

// Set all preset holidays into an array
const predefinedHolidays = [
    { month: 1, day: 1, name: "New Year" },
    { month: 4, day: 18, name: "Good Friday" },
    { month: 5, day: 19, name: "Victoria Day" },
    { month: 7, day: 1, name: "Canada Day" },
    { month: 8, day: 4, name: "Civic Holiday" },
    { month: 9, day: 1, name: "Labour Day" },
    { month: 10, day: 13, name: "Thanksgiving" },
    { month: 11, day: 11, name: "Remembrance Day" },
    { month: 12, day: 25, name: "Christmas Day" },
    { month: 12, day: 26, name: "Boxing Day" }
];

// Function to load predefined holidays into events
function loadPredefinedHolidays() {
    const today = new Date();
    const year = today.getFullYear();
    predefinedHolidays.forEach(holiday => {
        const dateKey = `${year}-${holiday.month}-${holiday.day}`;
        // If there are no events for this date yet, create an empty array
        if (!events[dateKey]) {
            events[dateKey] = [];
        }

        // Check if this holiday already exists in the events array
        const alreadyExists = events[dateKey].some(event => event.name === holiday.name);

        // If not already in events, add the holiday
        if (!alreadyExists) {
            events[dateKey].push({
                name: holiday.name,
                details: "Holiday",
                time: "All Day"
            });
        }
    });

    // Save the updated events object to localStorage
    localStorage.setItem("events", JSON.stringify(events));
}

// Run functions to load holidays and display the calendar
loadPredefinedHolidays();
loadCalendar(currentDate);

// Function to generate the calendar for the current month
function loadCalendar(date) {
    // Get year, month, and day details for this calendar view
    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const numOfDaysInMonth = new Date(year, month + 1, 0).getDate();
    const allCells = calendarBody.getElementsByTagName("td");

    // Update the displayed month and year at the top of the calendar
    currentMonth.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    let currentDay = 1;
    let isCurrentMonth = false;

    // Get today's date to highlight the current day
    const today = new Date();
    const todayDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    // Loop through all cells in the calendar and populate them
    for (let x = 0; x < allCells.length; x++) {
        const currentCell = allCells[x];
        
        // Clear any previous content and classes from the cell
        currentCell.textContent = "";
        currentCell.classList.remove("booked", "current-day");

        // Start populating days once we reach the first day of the month
        if (x === firstDayOfMonth)
            isCurrentMonth = true;

        // If we're still within the current month days
        if (currentDay <= numOfDaysInMonth && isCurrentMonth) {
            const dateFull = `${year}-${month + 1}-${currentDay}`;
            currentCell.textContent = currentDay;

            // Highlight the current day if it matches today's date
            if (dateFull === todayDate) {
                currentCell.classList.add("current-day");
            }

            // Mark the day as booked if there are events on this date
            if (events[dateFull] && events[dateFull].length > 0) {
                currentCell.classList.add("booked");
            }

            // Add click event to open the modal for adding/viewing events
            currentCell.onclick = () => openModal(dateFull);

            // Move to the next day
            currentDay++;
        }
    }
}

// Function to open the modal when a date is clicked
function openModal(dateFull) {
    // Display the modal and reset form fields
    modal.style.display = "block";
    modalDate.textContent = `Events on ${dateFull}`;
    eventNameInput.value = "";
    eventDetailsInput.value = "";

    // Reset time selectors to default values
    eventHourSelect.value = "12";
    eventMinuteSelect.value = "00";
    eventPeriodSelect.value = "AM";

    // Clear the event list in the modal
    eventList.innerHTML = "";

    // Initialize events array for this date if it doesn't exist
    if (!events[dateFull]) {
        events[dateFull] = [];
    }

    // Populate the list of existing events for this date
    events[dateFull].forEach((event, index) => {
        const eventItem = document.createElement("div");
        eventItem.innerHTML = `<strong>${event.time}</strong> - ${event.name}: ${event.details}`;

        // Create delete button for each event
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        // Add functionality to delete the selected event
        deleteButton.onclick = () => deleteEvent(dateFull, index);

        // Add the delete button to the event item display
        eventItem.appendChild(deleteButton);

        // Append the event item to the modal's event list
        eventList.appendChild(eventItem);
    });

    // Set the save button's functionality to add an event on this date
    saveEventButton.onclick = () => saveEvent(dateFull);
}

// Function to close the modal window
function closeModal() {
    modal.style.display = "none";
}

// Function to save a new event to a date
function saveEvent(dateFull) {
    // Get values from the input fields
    const name = eventNameInput.value.trim();
    const details = eventDetailsInput.value.trim();
    const hour = eventHourSelect.value;
    const minute = eventMinuteSelect.value;
    const period = eventPeriodSelect.value;

    // Check if event name is filled out
    if (name === "") {
        alert("Please enter an event name.");
        return;
    }

    // Format time and create the event object
    const time = `${hour}:${minute} ${period}`;
    events[dateFull].push({ name, details, time });

    // Save the updated events to localStorage
    localStorage.setItem("events", JSON.stringify(events));

    // Close the modal and refresh the calendar display
    closeModal();
    loadCalendar(currentDate);
}

// Function to delete an event from a date
function deleteEvent(dateFull, index) {
    // Remove the event from the array
    events[dateFull].splice(index, 1);

    // If no events remain on that date, remove the date entry
    if (events[dateFull].length === 0) {
        delete events[dateFull];
    }

    // Save the updated events to localStorage
    localStorage.setItem("events", JSON.stringify(events));

    // Refresh the modal and calendar display
    openModal(dateFull);
    loadCalendar(currentDate);
}

// Function to populate the time dropdown selectors
function initTimeSelectors() {
    // Populate hour selector (01 - 12)
    for (let h = 1; h <= 12; h++) {
        const option = document.createElement("option");
        option.value = h < 10 ? `0${h}` : `${h}`;
        option.textContent = h;
        eventHourSelect.appendChild(option);
    }

    // Populate minute selector (00 - 55) in steps of 5
    for (let m = 0; m < 60; m += 5) {
        const option = document.createElement("option");
        option.value = m < 10 ? `0${m}` : `${m}`;
        option.textContent = option.value;
        eventMinuteSelect.appendChild(option);
    }

    // Set default time to 12:00 AM
    eventHourSelect.value = "12";
    eventMinuteSelect.value = "00";
    eventPeriodSelect.value = "AM";
}

// Event listener to close modal when "X" button is clicked
closeButton.addEventListener("click", closeModal);

// Event listener to close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Event listener for previous month button
previousMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    loadCalendar(currentDate);
});

// Event listener for next month button
nextMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    loadCalendar(currentDate);
});

// Initialize time dropdown selectors
initTimeSelectors();

// Load the calendar for the current date when the page loads
loadCalendar(currentDate);