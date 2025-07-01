// Popup script for CodeForces Calendar Extension

// DOM elements
let connectBtn, disconnectBtn, refreshBtn, contestsList, loading, errorMessage;
let authStatus, timezoneSelect, reminderCheckbox, successToast, errorToast;

// State
let isAuthenticated = false;
let contests = [];

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    initializePopup();
});

function initializeElements() {
    connectBtn = document.getElementById('connect-btn');
    disconnectBtn = document.getElementById('disconnect-btn');
    refreshBtn = document.getElementById('refresh-btn');
    contestsList = document.getElementById('contests-list');
    loading = document.getElementById('loading');
    errorMessage = document.getElementById('error-message');
    authStatus = document.getElementById('auth-status');
    timezoneSelect = document.getElementById('timezone-select');
    reminderCheckbox = document.getElementById('reminder-checkbox');
    successToast = document.getElementById('success-toast');
    errorToast = document.getElementById('error-toast');
}

function setupEventListeners() {
    if (connectBtn) {
        connectBtn.addEventListener('click', handleGoogleConnect);
    }
    
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', handleGoogleDisconnect);
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefreshContests);
    }
    
    if (timezoneSelect) {
        timezoneSelect.addEventListener('change', handleTimezoneChange);
    }
    
    if (reminderCheckbox) {
        reminderCheckbox.addEventListener('change', handleReminderChange);
    }
}

async function initializePopup() {
    try {
        // Check authentication status
        await checkAuthStatus();
        
        // Load user settings
        await loadUserSettings();
        
        // Load contests
        await loadContests();
        
    } catch (error) {
        console.error('Error initializing popup:', error);
        showError('Failed to initialize extension');
    }
}

// Authentication functions
async function checkAuthStatus() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(
            { action: 'checkAuthStatus' },
            (response) => {
                isAuthenticated = response && response.isAuthenticated;
                updateAuthUI();
                resolve();
            }
        );
    });
}

async function handleGoogleConnect() {
    try {
        showLoading('Connecting to Google Calendar...');
        
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
                { action: 'authenticateGoogle' },
                resolve
            );
        });
        
        if (response.success) {
            isAuthenticated = true;
            updateAuthUI();
            showSuccess('Successfully connected to Google Calendar!');
        } else {
            showError(response.error || 'Failed to connect to Google Calendar');
        }
    } catch (error) {
        console.error('Google connect error:', error);
        showError('Failed to connect to Google Calendar');
    } finally {
        hideLoading();
    }
}

async function handleGoogleDisconnect() {
    try {
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
                { action: 'logout' },
                resolve
            );
        });
        
        if (response.success) {
            isAuthenticated = false;
            updateAuthUI();
            showSuccess('Disconnected from Google Calendar');
        } else {
            showError('Failed to disconnect');
        }
    } catch (error) {
        console.error('Disconnect error:', error);
        showError('Failed to disconnect');
    }
}

function updateAuthUI() {
    if (!authStatus) return;
    
    const connected = authStatus.querySelector('.auth-connected');
    const disconnected = authStatus.querySelector('.auth-disconnected');
    
    if (isAuthenticated) {
        connected.classList.remove('hidden');
        disconnected.classList.add('hidden');
    } else {
        connected.classList.add('hidden');
        disconnected.classList.remove('hidden');
    }
}

// Contest functions
async function loadContests() {
    try {
        showLoading('Loading contests...');
        hideError();
        
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
                { action: 'fetchContests' },
                resolve
            );
        });
        
        if (response.success) {
            contests = response.contests;
            renderContests();
        } else {
            showError(response.error || 'Failed to load contests');
        }
    } catch (error) {
        console.error('Error loading contests:', error);
        showError('Failed to load contests');
    } finally {
        hideLoading();
    }
}

async function handleRefreshContests() {
    // Clear cache by removing stored contests
    chrome.storage.local.remove(['contests', 'lastFetch'], () => {
        loadContests();
    });
}

function renderContests() {
    if (!contestsList) return;
    
    if (!contests || contests.length === 0) {
        contestsList.innerHTML = `
            <div class="no-contests">
                <p>No upcoming contests found.</p>
                <button class="btn btn--secondary btn--sm" onclick="handleRefreshContests()">
                    Refresh
                </button>
            </div>
        `;
        return;
    }
    
    contestsList.innerHTML = contests.map(contest => createContestCard(contest)).join('');
    
    // Add event listeners to "Add to Calendar" buttons
    contests.forEach(contest => {
        const button = document.getElementById(`add-btn-${contest.id}`);
        if (button) {
            button.addEventListener('click', () => handleAddToCalendar(contest));
        }
    });
}

function createContestCard(contest) {
    const startTime = new Date(contest.startTimeSeconds * 1000);
    const duration = Math.round(contest.durationSeconds / 3600 * 10) / 10; // Duration in hours
    const contestUrl = `https://codeforces.com/contest/${contest.id}`;
    
    const timeString = startTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const disabled = !isAuthenticated ? 'disabled' : '';
    const buttonText = isAuthenticated ? 'Add to Calendar' : 'Connect Google First';
    
    return `
        <div class="contest-card">
            <div class="contest-header">
                <h3 class="contest-title">${escapeHtml(contest.name)}</h3>
                <span class="contest-type">${contest.type}</span>
            </div>
            <div class="contest-details">
                <div class="contest-time">
                    <span class="time-icon">🕒</span>
                    <span>${timeString}</span>
                </div>
                <div class="contest-duration">
                    <span class="duration-icon">⏱️</span>
                    <span>${duration} hours</span>
                </div>
            </div>
            <div class="contest-actions">
                <a href="${contestUrl}" target="_blank" class="btn btn--outline btn--sm">
                    View Contest
                </a>
                <button 
                    id="add-btn-${contest.id}" 
                    class="btn btn--primary btn--sm" 
                    ${disabled}
                >
                    ${buttonText}
                </button>
            </div>
        </div>
    `;
}

async function handleAddToCalendar(contest) {
    try {
        const button = document.getElementById(`add-btn-${contest.id}`);
        if (button) {
            button.textContent = 'Adding...';
            button.disabled = true;
        }
        
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
                { action: 'addToCalendar', contest },
                resolve
            );
        });
        
        if (response.success) {
            showSuccess(`Added "${contest.name}" to your calendar!`);
            if (button) {
                button.textContent = 'Added ✓';
                button.classList.remove('btn--primary');
                button.classList.add('btn--success');
            }
        } else {
            showError(response.error || 'Failed to add event to calendar');
            if (button) {
                button.textContent = 'Add to Calendar';
                button.disabled = false;
            }
        }
    } catch (error) {
        console.error('Error adding to calendar:', error);
        showError('Failed to add event to calendar');
        
        const button = document.getElementById(`add-btn-${contest.id}`);
        if (button) {
            button.textContent = 'Add to Calendar';
            button.disabled = false;
        }
    }
}

// Settings functions
async function loadUserSettings() {
    try {
        const result = await chrome.storage.sync.get(['timezone', 'reminders']);
        
        if (timezoneSelect && result.timezone) {
            timezoneSelect.value = result.timezone;
        }
        
        if (reminderCheckbox) {
            reminderCheckbox.checked = result.reminders !== false; // Default to true
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function handleTimezoneChange() {
    try {
        const timezone = timezoneSelect.value;
        await chrome.storage.sync.set({ timezone });
        
        // Re-render contests with new timezone
        renderContests();
    } catch (error) {
        console.error('Error saving timezone:', error);
    }
}

async function handleReminderChange() {
    try {
        const reminders = reminderCheckbox.checked;
        await chrome.storage.sync.set({ reminders });
    } catch (error) {
        console.error('Error saving reminder setting:', error);
    }
}

// UI Helper functions
function showLoading(message = 'Loading...') {
    if (loading) {
        loading.querySelector('p').textContent = message;
        loading.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loading) {
        loading.classList.add('hidden');
    }
}

function showError(message) {
    if (errorMessage) {
        errorMessage.querySelector('p').textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    if (errorToast) {
        errorToast.textContent = message;
        errorToast.classList.add('show');
        setTimeout(() => {
            errorToast.classList.remove('show');
        }, 4000);
    }
}

function hideError() {
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

function showSuccess(message) {
    if (successToast) {
        successToast.textContent = message;
        successToast.classList.add('show');
        setTimeout(() => {
            successToast.classList.remove('show');
        }, 3000);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle external links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href.startsWith('http')) {
        e.preventDefault();
        chrome.tabs.create({ url: e.target.href });
    }
});