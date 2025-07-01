# Create the Chrome extension files

# 1. Create manifest.json for Chrome Extension
manifest_json = {
    "manifest_version": 3,
    "name": "CodeForces Calendar Extension",
    "version": "1.0.0",
    "description": "Add upcoming CodeForces contests to your Google Calendar with one click",
    "icons": {
        "16": "icons/icon16.png",
        "32": "icons/icon32.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
    },
    "action": {
        "default_popup": "popup.html",
        "default_title": "CodeForces Calendar Extension",
        "default_icon": {
            "16": "icons/icon16.png",
            "32": "icons/icon32.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png"
        }
    },
    "background": {
        "service_worker": "background.js"
    },
    "permissions": [
        "storage",
        "identity",
        "activeTab",
        "alarms"
    ],
    "host_permissions": [
        "https://codeforces.com/*",
        "https://www.googleapis.com/*"
    ],
    "oauth2": {
        "client_id": "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com",
        "scopes": [
            "https://www.googleapis.com/auth/calendar.events"
        ]
    },
    "content_security_policy": {
        "extension_pages": "script-src 'self'; object-src 'self'"
    }
}

import json
print("manifest.json:")
print(json.dumps(manifest_json, indent=2))