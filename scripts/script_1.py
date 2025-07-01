# Let's prepare the contest data that will be used in the extension
import json
from datetime import datetime, timedelta

# Sample contest data structure for the extension
upcoming_contests = [
    {
        "id": 2119,
        "name": "Codeforces Round (Div. 2)",
        "startTimeSeconds": 1720180500,  # July 5, 2025 14:35:00
        "durationSeconds": 7200,
        "type": "CF"
    },
    {
        "id": 2124,
        "name": "Codeforces Round (Div. 1 + Div. 2)", 
        "startTimeSeconds": 1720267200,  # July 6, 2025 14:35:00
        "durationSeconds": 10800,
        "type": "CF"
    },
    {
        "id": 2122,
        "name": "Codeforces Round (Div. 1 + Div. 2)",
        "startTimeSeconds": 1721394900,  # July 19, 2025 14:35:00
        "durationSeconds": 9000,
        "type": "CF"
    }
]

# Format the data for better understanding
for contest in upcoming_contests:
    start_time = datetime.fromtimestamp(contest['startTimeSeconds'])
    duration_hours = contest['durationSeconds'] / 3600
    
    print(f"Contest: {contest['name']}")
    print(f"Start: {start_time.strftime('%B %d, %Y at %I:%M %p')}")
    print(f"Duration: {duration_hours} hours")
    print(f"End: {(start_time + timedelta(seconds=contest['durationSeconds'])).strftime('%B %d, %Y at %I:%M %p')}")
    print("-" * 50)

# Create JSON data for the extension
extension_data = {
    "contests": upcoming_contests,
    "api_endpoint": "https://codeforces.com/api/contest.list"
}

print("\nExtension data structure:")
print(json.dumps(extension_data, indent=2))