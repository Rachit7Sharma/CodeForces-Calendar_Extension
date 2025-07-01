# Create popup.html for Chrome extension
popup_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeForces Calendar Extension</title>
    <style>
        /* Extension-specific styles for popup */
        body {
            width: 400px;
            min-height: 500px;
            max-height: 600px;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            overflow-x: hidden;
        }

        .container {
            padding: 16px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            padding: 16px;
            background: linear-gradient(135deg, #2196F3, #21CBF3);
            color: white;
            margin: -16px -16px 20px -16px;
        }

        .header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }

        .header .subtitle {
            margin: 4px 0 0 0;
            font-size: 12px;
            opacity: 0.9;
        }

        .auth-section {
            margin-bottom: 20px;
            padding: 12px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }

        .auth-status p {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #333;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
        }

        .btn--primary {
            background: #2196F3;
            color: white;
        }

        .btn--primary:hover {
            background: #1976D2;
        }

        .btn--outline {
            background: white;
            color: #2196F3;
            border: 1px solid #2196F3;
        }

        .btn--outline:hover {
            background: #f5f5f5;
        }

        .btn--secondary {
            background: #f5f5f5;
            color: #666;
        }

        .btn--secondary:hover {
            background: #e0e0e0;
        }

        .btn--success {
            background: #4CAF50;
            color: white;
        }

        .btn--sm {
            padding: 6px 12px;
            font-size: 12px;
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .hidden {
            display: none !important;
        }

        .flex {
            display: flex;
        }

        .justify-between {
            justify-content: space-between;
        }

        .items-center {
            align-items: center;
        }

        .contests-section h2 {
            margin: 0 0 12px 0;
            font-size: 16px;
            color: #333;
        }

        .loading {
            text-align: center;
            padding: 20px;
        }

        .loading-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #2196F3;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loading p {
            margin: 0;
            font-size: 14px;
            color: #666;
        }

        .error-message {
            background: #ffebee;
            color: #c62828;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #ffcdd2;
            margin-bottom: 16px;
        }

        .error-message p {
            margin: 0;
            font-size: 14px;
        }

        .contests-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .contest-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
        }

        .contest-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }

        .contest-title {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #333;
            flex: 1;
            line-height: 1.3;
        }

        .contest-type {
            background: #e3f2fd;
            color: #1976d2;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            margin-left: 8px;
        }

        .contest-details {
            margin-bottom: 12px;
        }

        .contest-time, .contest-duration {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }

        .time-icon, .duration-icon {
            margin-right: 6px;
        }

        .contest-actions {
            display: flex;
            gap: 8px;
        }

        .contest-actions .btn {
            flex: 1;
            text-align: center;
            text-decoration: none;
        }

        .no-contests {
            text-align: center;
            padding: 20px;
            color: #666;
        }

        .no-contests p {
            margin: 0 0 12px 0;
        }

        .settings-section {
            margin-top: 20px;
            padding: 12px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }

        .settings-section h3 {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #333;
        }

        .form-group {
            margin-bottom: 12px;
        }

        .form-group label {
            display: block;
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }

        .form-group select, .form-group input {
            width: 100%;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
        }

        .form-group input[type="checkbox"] {
            width: auto;
            margin-right: 6px;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
        }

        .checkbox-group label {
            margin: 0;
            font-size: 12px;
        }

        /* Toast notifications */
        .toast {
            position: fixed;
            bottom: 16px;
            left: 16px;
            right: 16px;
            padding: 12px;
            border-radius: 6px;
            font-size: 14px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s;
            z-index: 1000;
        }

        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }

        .success-toast {
            background: #4CAF50;
            color: white;
        }

        .error-toast {
            background: #f44336;
            color: white;
        }

        .refresh-icon {
            display: inline-block;
            transition: transform 0.3s;
        }

        .refresh-btn:hover .refresh-icon {
            transform: rotate(180deg);
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>CodeForces Calendar</h1>
            <p class="subtitle">Add contests to Google Calendar</p>
        </header>

        <div class="auth-section">
            <div id="auth-status" class="auth-status">
                <div class="auth-disconnected">
                    <p>Connect your Google Calendar to add contests</p>
                    <button id="connect-btn" class="btn btn--primary">Connect Google Calendar</button>
                </div>
                <div class="auth-connected hidden">
                    <p>✓ Connected to Google Calendar</p>
                    <button id="disconnect-btn" class="btn btn--outline btn--sm">Disconnect</button>
                </div>
            </div>
        </div>

        <div class="contests-section">
            <div class="flex justify-between items-center">
                <h2>Upcoming Contests</h2>
                <button id="refresh-btn" class="btn btn--secondary btn--sm">
                    <span class="refresh-icon">↻</span> Refresh
                </button>
            </div>

            <div id="loading" class="loading hidden">
                <div class="loading-spinner"></div>
                <p>Loading contests...</p>
            </div>

            <div id="error-message" class="error-message hidden">
                <p>Failed to load contests. Please try again.</p>
            </div>

            <div id="contests-list" class="contests-list">
                <!-- Contests will be populated here -->
            </div>
        </div>

        <div class="settings-section">
            <h3>Settings</h3>
            <div class="form-group">
                <label for="timezone-select">Timezone:</label>
                <select id="timezone-select">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London Time</option>
                    <option value="Europe/Paris">Central Europe</option>
                    <option value="Asia/Tokyo">Tokyo Time</option>
                    <option value="Asia/Shanghai">China Time</option>
                    <option value="Asia/Kolkata">India Time</option>
                </select>
            </div>
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="reminder-checkbox" checked>
                    <label for="reminder-checkbox">Enable reminders</label>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast notifications -->
    <div id="success-toast" class="toast success-toast"></div>
    <div id="error-toast" class="toast error-toast"></div>

    <script src="popup.js"></script>
</body>
</html>'''

print("popup.html for Chrome Extension:")
print(popup_html)