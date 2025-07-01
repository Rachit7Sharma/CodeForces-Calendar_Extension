# CodeForces-Calendar-Extension

A Chrome extension that syncs upcoming CodeForces contests to your Google Calendar with one click—powered by the CodeForces and Google Calendar APIs.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 🗓️ **One-click Sync**: Add upcoming CodeForces contests directly to your Google Calendar.
- 🔌 **Seamless Integration**: Utilizes CodeForces API for contest info and Google Calendar API for event creation.
- 🚀 **User-Friendly**: Simple Chrome extension interface for fast access.
- 🔒 **Secure Authentication**: Uses OAuth 2.0 for secure Google Calendar access.

---

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rachit7Sharma/CodeForces-Calendar_Extension.git
   ```

2. **Open Chrome and go to Extension Management**
   - Navigate to `chrome://extensions/`.

3. **Enable Developer Mode**
   - Toggle the Developer mode switch (top right).

4. **Load Unpacked Extension**
   - Click on "Load unpacked".
   - Select the `CodeForces-Calendar_Extension` directory.

5. **Configure Google API Credentials**
   - See [Configuration](#configuration) for setting up OAuth credentials.

---

## Usage

1. Click the extension icon in your Chrome toolbar.
2. Authenticate with your Google account (OAuth popup).
3. View upcoming CodeForces contests.
4. Click "Add to Calendar" next to any contest to sync it instantly.

---

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend/Scripts:** Python (for setup or auxiliary scripts, if any)
- **APIs:**  
  - [CodeForces API](https://codeforces.com/apiHelp)
  - [Google Calendar API](https://developers.google.com/calendar)

---

## Configuration

> **Note:** You must set up Google API credentials to allow the extension to add events to your calendar.

1. Go to [Google Cloud Console](https://console.developers.google.com/).
2. Create a new project.
3. Enable the Google Calendar API for your project.
4. Set up OAuth 2.0 credentials:
    - Application type: Chrome App or Web Application
    - Add your extension’s ID or localhost as an authorized origin.
5. Download `credentials.json` and place it in the appropriate directory (see project code for details).
6. Update any necessary client IDs in the extension’s configuration files.

---

## Contributing

Contributions are welcome! Please open issues or pull requests.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Author

- [Rachit7Sharma](https://github.com/Rachit7Sharma)
