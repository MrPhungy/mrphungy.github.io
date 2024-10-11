const tiltEls = document.querySelectorAll('.tilt');

const tiltMove = (x, y) => `perspective(1000px) rotateX(${x}deg) rotateY(${y}deg)`; 

tiltEls.forEach(tilt => {
    const height = tilt.clientHeight;
    const width = tilt.clientWidth;

    tilt.addEventListener('mousemove', (e) => {
        const x = e.layerX;
        const y = e.layerY;
        const multiplier = 60;

        const yRotate = multiplier * ((x - width / 2) / width);
        const xRotate = -multiplier * ((y - height / 2) / height);

        tilt.style.transform = tiltMove(xRotate, yRotate);
    });

    tilt.addEventListener('mouseout', () => tilt.style.transform = tiltMove(0, 0))
})
 
// Fade in for top left icons only on index.html
window.addEventListener('load', function() {
    // Check if we are on the index.html page
    if (window.location.pathname.includes('index.html')) {
        // Select all navigation items (links in your list)
        const navItems = document.querySelectorAll('nav ul li:not(.home-icon) a'); // Select only the links, excluding home icon
        
        // Loop through each navigation item
        navItems.forEach((item, index) => {
            // Set the animation delay based on the index
            item.style.opacity = 0; // Initially hide the text
            item.style.animation = `fadeIn 1s ease-in forwards`; // Set animation
            item.style.animationDelay = `${index * 0.3}s`; // Adjust the delay based on index
            item.style.visibility = 'visible'; // Ensure visibility
        });

        // Fade in for the name element
        const nameElement = document.querySelector('.name'); // Select the name element

        // Add a class to make the name and home icon visible after 1.3 seconds
        setTimeout(() => {
            nameElement.classList.add('visible'); // Add class to trigger fade-in for name
        }, 1800); // Delay for 1.3 seconds before fading in
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
    // Fetch the notes.json file
    fetch('/data/notes.json')
        .then(response => response.json())
        .then(data => {
            // Check which page we're on
            if (document.querySelector('.recent-notes')) {
                // If we're on index.html, display the 5 most recent notes
                displayRecentNotes(data);
            } else if (document.querySelector('.all-notes')) {
                // If we're on notes.html, display all notes
                displayAllNotes(data);
            }
        })
        .catch(error => console.error('Error fetching notes:', error));
});

// Helper function to format the date for recent notes
function formatDateForRecent(dateString) {
    const options = { month: 'long', year: 'numeric' }; // Options for formatting
    const date = new Date(dateString);
    return date.toLocaleString('en-US', options); // Return formatted date
}

//recent notes in index.html
function displayRecentNotes(notesData) {
    const recentNotesContainer = document.querySelector('.recent-notes');

    // Sort notes by date in descending order
    const sortedNotes = notesData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Take the 5 most recent notes
    const recentNotes = sortedNotes.slice(0, 5);

    recentNotes.forEach(note => {
        let noteLink = window.location.pathname.includes('notes.html') ? `../${note.link}` : note.link;

        let formattedDate = formatDateForRecent(note.date); // Format the date for recent notes
        let noteElement = `
            <a href="${noteLink}" class="notes-link">
                ${note.title}
                <span class="date">${formattedDate}</span>
            </a>
            <div class="notes-line"></div>
        `;
        recentNotesContainer.innerHTML += noteElement;
    });
}

// Helper function to format the date
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric' }; // Options for formatting
    const date = new Date(dateString);
    return date.toLocaleString('en-US', options); // Return formatted date
}

//All notes in notes.html
function displayAllNotes(notesData) {
    const notesContainer = document.querySelector('.all-notes');

    // Group notes by year
    const notesByYear = notesData.reduce((acc, note) => {
        const year = new Date(note.date).getFullYear(); // Get the year from the date
        if (!acc[year]) {
            acc[year] = []; // Create an array for the year if it doesn't exist
        }
        acc[year].push(note); // Push the note into the respective year
        return acc;
    }, {});

    // Sort years in descending order
    const sortedYears = Object.keys(notesByYear).sort((a, b) => b - a);

    // Iterate over the sorted years and create HTML
    sortedYears.forEach(year => {
        // Create a header for the year
        let yearElement = `<h1 class="notes-year">${year}</h1>`;
        notesContainer.innerHTML += yearElement;

        // Create note links for the year
        notesByYear[year].forEach(note => {
            let noteLink = window.location.pathname.includes('notes.html') ? `../${note.link}` : note.link;

            let formattedDate = formatDate(note.date); // Format the date
            let noteElement = `
                <a href="${noteLink}" class="notes-link">
                    ${note.title}
                    <span class="date">${formattedDate}</span>
                </a>
                <div class="notes-line"></div>
            `;
            notesContainer.innerHTML += noteElement;
        });
    });
}

// thought of the day
async function fetchThoughts() {
    const response = await fetch('data/thoughtoftheday.json');
    const data = await response.json();
    return data.thoughts;
}

async function displayThought() {
    const thoughts = await fetchThoughts();
    const date = new Date();

    // Get the day of the year (0-364), loop back after day 365
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay); // Day of the year (0-364)

    // Access the thought based on the day of the year (cycle through after day 365)
    const thought = thoughts[dayOfYear % thoughts.length]; // Loop using modulo
    document.getElementById("daily-thought").innerText = thought;
}

// Function to calculate milliseconds until midnight
function millisecondsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return midnight - now;
}

// Initial display when the page loads
displayThought();

// Set a timeout to refresh the thought at midnight
setTimeout(function() {
    // Update the thought at midnight
    displayThought();

    // Set an interval to update the thought every 24 hours after midnight
    setInterval(displayThought, 24 * 60 * 60 * 1000); // Update every 24 hours
}, millisecondsUntilMidnight());


// Countdown
function startCountdown() {
    const countdownElement = document.getElementById("countdown-timer");

    // Function to calculate the next day at midnight
    function getNextMidnight() {
        const now = new Date();
        const nextMidnight = new Date(now);
        nextMidnight.setHours(24, 0, 0, 0); // Set time to the next midnight
        return nextMidnight;
    }

    // Update the countdown every second
    const interval = setInterval(() => {
        const now = new Date();
        const nextMidnight = getNextMidnight();
        const timeRemaining = nextMidnight - now;

        // Calculate hours, minutes, and seconds remaining
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        // Display the result in the countdown element
        countdownElement.innerText = `New thought in: ${hours}h ${minutes}m ${seconds}s`;

        // If the countdown is finished
        if (timeRemaining < 0) {
            clearInterval(interval);
            countdownElement.innerText = "Resetting countdown...";

            // Start a new countdown for the next day
            setTimeout(() => {
                startCountdown(); // Restart the countdown for the next day
            }, 1000); // Wait 1 second before starting the new countdown
        }
    }, 1000);
}
startCountdown();



