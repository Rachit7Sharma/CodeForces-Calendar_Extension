// State management
let isAuthenticated = false;
let contests = [];
let userSettings = {
    timezone: 'UTC',
    reminders: true
};

// Sample contest data for demonstration - Updated with future dates
const sampleContests = [
    {
        id: 2119,
        name: "Codeforces Round 970 (Div. 2)",
        startTimeSeconds: 1751515200, // July 3, 2025
        durationSeconds: 7200,
        type: "CF",
        phase: "BEFORE"
    },
    {
        id: 2124,
        name: "Codeforces Round 971 (Div. 1 + Div. 2)",
        startTimeSeconds: 1751601600, // July 4, 2025
        durationSeconds: 10800,
        type: "CF",
        phase: "BEFORE"
    },
    {
        id: 2125,
        name: "Educational Codeforces Round 165",
        startTimeSeconds: 1751688000, // July 5, 2025
        durationSeconds: 7200,
        type: "ICPC",
        phase: "BEFORE"
    },
    {
        id: 2126,
        name: "Codeforces Global Round 28",
        startTimeSeconds: 1751774400, // July 6, 2025
        durationSeconds: 9000,
        type: "CF",
        phase: "BEFORE"
    },
    {
        id: 2127,
        name: "Codeforces Round 972 (Div. 2)",
        startTimeSeconds: 1752033600, // July 9, 2025
        durationSeconds: 7200,
        type: "CF",
        phase: "BEFORE"
    }
];

// DOM elements
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const refreshBtn = document.getElementById('refresh-btn');
const contestsList = document.getElementById('contests-list');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const authStatus = document.getElementById('auth-status');
const timezoneSelect = document.getElementById('timezone-select');
const reminderCheckbox = document.getElementById('reminder-checkbox');
const successToast = document.getElementById('success-toast');
const errorToast = document.getElementById('error-toast');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadContests();
});

function initializeApp() {
    // Load user settings
    loadSettings();
    
    // Set initial authentication state
    updateAuthUI();
    
    // Set timezone to user's local timezone by default
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezoneSelect.querySelector(`option[value="${userTimezone}"]`)) {
        timezoneSelect.value = userTimezone;
        userSettings.timezone = userTimezone;
    }
}

function setupEventListeners() {
    connectBtn.addEventListener('click', authenticateWithGoogle);
    disconnectBtn.addEventListener('click', disconnectFromGoogle);
    refreshBtn.addEventListener('click', loadContests);
    timezoneSelect.addEventListener('change', updateTimezone);
    reminderCheckbox.addEventListener('change', updateReminderSetting);
}

function loadSettings() {
    // Simulate chrome.storage.sync.get
    const savedSettings = localStorage.getItem('codeforcesExtensionSettings');
    if (savedSettings) {
        userSettings = { ...userSettings, ...JSON.parse(savedSettings) };
        timezoneSelect.value = userSettings.timezone;
        reminderCheckbox.checked = userSettings.reminders;
    }
    
    // Check authentication state
    const authState = localStorage.getItem('googleCalendarAuth');
    isAuthenticated = authState === 'true';
}

function saveSettings() {
    // Simulate chrome.storage.sync.set
    localStorage.setItem('codeforcesExtensionSettings', JSON.stringify(userSettings));
}

function updateTimezone() {
    userSettings.timezone = timezoneSelect.value;
    saveSettings();
    renderContests(); // Re-render with new timezone
}

function updateReminderSetting() {
    userSettings.reminders = reminderCheckbox.checked;
    saveSettings();
}

async function authenticateWithGoogle() {
    // Simulate OAuth2 flow
    showLoading(true);
    
    try {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful authentication
        isAuthenticated = true;
        localStorage.setItem('googleCalendarAuth', 'true');
        
        updateAuthUI();
        showToast('Connected to Google Calendar successfully!', 'success');
    } catch (error) {
        showToast('Failed to connect to Google Calendar', 'error');
    } finally {
        showLoading(false);
    }
}

function disconnectFromGoogle() {
    isAuthenticated = false;
    localStorage.removeItem('googleCalendarAuth');
    updateAuthUI();
    showToast('Disconnected from Google Calendar', 'success');
}

function updateAuthUI() {
    const authDisconnected = authStatus.querySelector('.auth-disconnected');
    const authConnected = authStatus.querySelector('.auth-connected');
    
    if (isAuthenticated) {
        authDisconnected.classList.add('hidden');
        authConnected.classList.remove('hidden');
    } else {
        authDisconnected.classList.remove('hidden');
        authConnected.classList.add('hidden');
    }
    
    // Update add to calendar buttons
    const addButtons = document.querySelectorAll('.add-to-calendar-btn');
    addButtons.forEach(btn => {
        btn.disabled = !isAuthenticated;
        btn.textContent = isAuthenticated ? 'Add to Calendar' : 'Connect Calendar First';
    });
}

async function loadContests() {
    showLoading(true);
    errorMessage.classList.add('hidden');
    
    // Add spinning animation to refresh button
    const refreshIcon = refreshBtn.querySelector('.refresh-icon');
    refreshIcon.classList.add('spinning');
    
    try {
        // Simulate API call to CodeForces
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real extension, this would be:
        // const response = await fetch('https://codeforces.com/api/contest.list');
        // const data = await response.json();
        
        // Filter for upcoming contests only
        const now = Math.floor(Date.now() / 1000);
        contests = sampleContests.filter(contest => 
            contest.phase === 'BEFORE' && contest.startTimeSeconds > now
        );
        
        renderContests();
    } catch (error) {
        console.error('Failed to load contests:', error);
        errorMessage.classList.remove('hidden');
        contestsList.innerHTML = '';
    } finally {
        showLoading(false);
        refreshIcon.classList.remove('spinning');
    }
}

function renderContests() {
    if (contests.length === 0) {
        contestsList.innerHTML = '<div class="no-contests" style="text-align: center; padding: var(--space-32); color: var(--color-text-secondary);"><p>No upcoming contests found.</p></div>';
        return;
    }
    
    contestsList.innerHTML = contests.map(contest => {
        const startDate = new Date(contest.startTimeSeconds * 1000);
        const endDate = new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000);
        const duration = Math.floor(contest.durationSeconds / 3600);
        const minutes = Math.floor((contest.durationSeconds % 3600) / 60);
        
        const formattedStartTime = formatDateTime(startDate);
        const timeUntilStart = getTimeUntilStart(startDate);
        
        return `
            <div class="contest-card" data-contest-id="${contest.id}">
                <div class="contest-header">
                    <h3 class="contest-title">${contest.name}</h3>
                    <span class="contest-type">${contest.type}</span>
                </div>
                
                <div class="contest-details">
                    <div class="contest-detail">
                        <span class="contest-detail-label">Start Time</span>
                        <span class="contest-detail-value">${formattedStartTime}</span>
                    </div>
                    <div class="contest-detail">
                        <span class="contest-detail-label">Duration</span>
                        <span class="contest-detail-value">${duration}h ${minutes}m</span>
                    </div>
                    <div class="contest-detail">
                        <span class="contest-detail-label">Time Until Start</span>
                        <span class="contest-detail-value ${getTimeStatusClass(timeUntilStart)}">${timeUntilStart}</span>
                    </div>
                    <div class="contest-detail">
                        <span class="contest-detail-label">Contest ID</span>
                        <span class="contest-detail-value">#${contest.id}</span>
                    </div>
                </div>
                
                <div class="contest-actions">
                    <button class="btn btn--primary btn--sm add-to-calendar-btn" 
                            data-contest-id="${contest.id}"
                            ${!isAuthenticated ? 'disabled' : ''}>
                        ${isAuthenticated ? 'Add to Calendar' : 'Connect Calendar First'}
                    </button>
                    <a href="https://codeforces.com/contest/${contest.id}" 
                       target="_blank" 
                       class="btn btn--outline btn--sm">
                        View Contest
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners to add-to-calendar buttons
    document.querySelectorAll('.add-to-calendar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const contestId = parseInt(e.target.dataset.contestId);
            addToCalendar(contestId);
        });
    });
}

function formatDateTime(date) {
    const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: userSettings.timezone
    };
    return date.toLocaleString('en-US', options);
}

function getTimeUntilStart(startDate) {
    const now = new Date();
    const diff = startDate - now;
    
    if (diff < 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

function getTimeStatusClass(timeUntil) {
    if (timeUntil.includes('Started')) return 'status-live';
    if (timeUntil.includes('m') && !timeUntil.includes('h') && !timeUntil.includes('d')) return 'status-soon';
    return 'status-upcoming';
}

async function addToCalendar(contestId) {
    if (!isAuthenticated) {
        showToast('Please connect to Google Calendar first', 'error');
        return;
    }
    
    const contest = contests.find(c => c.id === contestId);
    if (!contest) return;
    
    const contestCard = document.querySelector(`[data-contest-id="${contestId}"]`);
    const addButton = contestCard.querySelector('.add-to-calendar-btn');
    
    // Show loading state
    contestCard.classList.add('adding');
    addButton.textContent = 'Adding...';
    addButton.disabled = true;
    
    try {
        // Simulate calendar API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real extension, this would create a calendar event:
        // const event = {
        //     summary: contest.name,
        //     start: { dateTime: new Date(contest.startTimeSeconds * 1000).toISOString() },
        //     end: { dateTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000).toISOString() },
        //     description: `CodeForces Contest: ${contest.name}\nType: ${contest.type}\nURL: https://codeforces.com/contest/${contest.id}`,
        //     reminders: userSettings.reminders ? { useDefault: false, overrides: [{ method: 'popup', minutes: 15 }] } : undefined
        // };
        
        // Show success state
        contestCard.classList.remove('adding');
        contestCard.classList.add('added');
        addButton.textContent = '✓ Added';
        
        showToast(`"${contest.name}" added to calendar!`, 'success');
        
    } catch (error) {
        console.error('Failed to add to calendar:', error);
        
        // Reset button state
        contestCard.classList.remove('adding');
        addButton.textContent = 'Add to Calendar';
        addButton.disabled = false;
        
        showToast('Failed to add contest to calendar', 'error');
    }
}

function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
        contestsList.classList.add('hidden');
    } else {
        loading.classList.add('hidden');
        contestsList.classList.remove('hidden');
    }
}

function showToast(message, type) {
    const toast = type === 'success' ? successToast : errorToast;
    const messageElement = toast.querySelector('p');
    
    messageElement.textContent = message;
    toast.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Update contest times periodically
setInterval(() => {
    if (contests.length > 0) {
        renderContests();
    }
}, 60000); // Update every minute