# Create background.js service worker for Chrome extension
background_js = '''// Background service worker for CodeForces Calendar Extension

// Constants
const CODEFORCES_API_URL = 'https://codeforces.com/api/contest.list';
const GOOGLE_CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Install event
chrome.runtime.onInstalled.addListener(() => {
    console.log('CodeForces Calendar Extension installed');
    
    // Set up periodic contest updates
    chrome.alarms.create('updateContests', {
        delayInMinutes: 30,
        periodInMinutes: 60
    });
});

// Alarm listener for periodic updates
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateContests') {
        fetchAndCacheContests();
    }
});

// Message handler for popup communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'fetchContests':
            handleFetchContests(sendResponse);
            return true; // Keep the message channel open for async response
            
        case 'authenticateGoogle':
            handleGoogleAuth(sendResponse);
            return true;
            
        case 'addToCalendar':
            handleAddToCalendar(message.contest, sendResponse);
            return true;
            
        case 'checkAuthStatus':
            handleCheckAuthStatus(sendResponse);
            return true;
            
        case 'logout':
            handleLogout(sendResponse);
            return true;
    }
});

// Fetch contests from CodeForces API
async function fetchAndCacheContests() {
    try {
        const response = await fetch(CODEFORCES_API_URL);
        const data = await response.json();
        
        if (data.status === 'OK') {
            // Filter for upcoming contests only
            const upcomingContests = data.result.filter(contest => 
                contest.phase === 'BEFORE'
            ).slice(0, 10); // Limit to 10 contests
            
            // Cache the results
            await chrome.storage.local.set({
                contests: upcomingContests,
                lastFetch: Date.now()
            });
            
            return upcomingContests;
        } else {
            throw new Error('Failed to fetch contests from CodeForces API');
        }
    } catch (error) {
        console.error('Error fetching contests:', error);
        throw error;
    }
}

// Handle contest fetching request from popup
async function handleFetchContests(sendResponse) {
    try {
        // Check if we have cached data
        const result = await chrome.storage.local.get(['contests', 'lastFetch']);
        const now = Date.now();
        
        if (result.contests && result.lastFetch && (now - result.lastFetch) < CACHE_DURATION) {
            // Return cached data
            sendResponse({ success: true, contests: result.contests });
        } else {
            // Fetch fresh data
            const contests = await fetchAndCacheContests();
            sendResponse({ success: true, contests });
        }
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

// Handle Google authentication
async function handleGoogleAuth(sendResponse) {
    try {
        const token = await getGoogleAccessToken();
        if (token) {
            await chrome.storage.local.set({ 
                googleAccessToken: token,
                isAuthenticated: true 
            });
            sendResponse({ success: true, token });
        } else {
            sendResponse({ success: false, error: 'Authentication failed' });
        }
    } catch (error) {
        console.error('Google auth error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Get Google access token using OAuth2
async function getGoogleAccessToken() {
    return new Promise((resolve, reject) => {
        const redirectUri = chrome.identity.getRedirectURL();
        const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
            `client_id=YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com&` +
            `response_type=token&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.events')}`;
        
        chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
        }, (responseUrl) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            
            if (responseUrl) {
                const token = extractTokenFromUrl(responseUrl);
                resolve(token);
            } else {
                reject(new Error('No response URL received'));
            }
        });
    });
}

// Extract access token from OAuth response URL
function extractTokenFromUrl(url) {
    const params = new URLSearchParams(url.split('#')[1]);
    return params.get('access_token');
}

// Handle adding contest to Google Calendar
async function handleAddToCalendar(contest, sendResponse) {
    try {
        const result = await chrome.storage.local.get(['googleAccessToken', 'isAuthenticated']);
        
        if (!result.isAuthenticated || !result.googleAccessToken) {
            sendResponse({ success: false, error: 'Not authenticated with Google Calendar' });
            return;
        }
        
        const event = createCalendarEvent(contest);
        
        const response = await fetch(GOOGLE_CALENDAR_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${result.googleAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });
        
        if (response.ok) {
            const createdEvent = await response.json();
            sendResponse({ success: true, event: createdEvent });
        } else {
            const error = await response.text();
            sendResponse({ success: false, error: `Failed to create event: ${error}` });
        }
    } catch (error) {
        console.error('Error adding to calendar:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Create calendar event object from contest data
function createCalendarEvent(contest) {
    const startTime = new Date(contest.startTimeSeconds * 1000);
    const endTime = new Date(startTime.getTime() + (contest.durationSeconds * 1000));
    
    return {
        summary: contest.name,
        description: `CodeForces Contest\\n\\nType: ${contest.type}\\nContest ID: ${contest.id}\\nURL: https://codeforces.com/contest/${contest.id}\\n\\nGood luck with the contest!`,
        start: {
            dateTime: startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
            dateTime: endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'popup', minutes: 30 },
                { method: 'popup', minutes: 10 }
            ]
        }
    };
}

// Check authentication status
async function handleCheckAuthStatus(sendResponse) {
    try {
        const result = await chrome.storage.local.get(['isAuthenticated', 'googleAccessToken']);
        
        if (result.isAuthenticated && result.googleAccessToken) {
            // Verify token is still valid
            const testResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
                headers: {
                    'Authorization': `Bearer ${result.googleAccessToken}`
                }
            });
            
            if (testResponse.ok) {
                sendResponse({ isAuthenticated: true });
            } else {
                // Token expired, clear auth state
                await chrome.storage.local.remove(['isAuthenticated', 'googleAccessToken']);
                sendResponse({ isAuthenticated: false });
            }
        } else {
            sendResponse({ isAuthenticated: false });
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        sendResponse({ isAuthenticated: false });
    }
}

// Handle logout
async function handleLogout(sendResponse) {
    try {
        await chrome.storage.local.remove(['isAuthenticated', 'googleAccessToken']);
        sendResponse({ success: true });
    } catch (error) {
        console.error('Error during logout:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Error handling for network requests
function handleNetworkError(error) {
    console.error('Network error:', error);
    return {
        success: false,
        error: 'Network error. Please check your internet connection.'
    };
}
'''

print("background.js service worker:")
print(background_js)