# Family Hub Dashboard

A smart home dashboard to manage family schedules, tasks, and presence, with widgets for weather and public transport. This project is a single-page application built with React, TypeScript, and Tailwind CSS, using Dexie.js for client-side database storage.

## Features

- **Interactive Calendar:** View events in a responsive month, week, day, or agenda layout. Click any day to add a new event.
- **iCal Integration:** Subscribe to external calendars (like public holidays or school schedules) via iCal URL. Calendars automatically refresh every 5 minutes.
- **Event Import:** Preview events from an iCal URL and selectively import them into the main calendar.
- **Task Management:** A simple and effective to-do list widget for managing household tasks.
- **Live Weather Widget:** Get real-time weather and a 7-day forecast for any location. Supports searching for cities or using your device's GPS.
- **Train Departures Widget:** See live train departure times from a selected source to multiple destinations.
- **Personalization:**
    - Filter the calendar view by household member.
    - Light and Dark mode support.
    - Customizable widgets and preferences.
- **Offline First:** All data is stored locally in the browser using Dexie.js (IndexedDB), making the app fast and available offline.

## Compatibility

This is a modern web application designed to run in any up-to-date web browser. It is fully compatible with desktop and mobile operating systems, including:

-   **Desktop:** Windows, macOS, Linux (via Chrome, Firefox, Edge, Safari)
-   **Mobile:** Android 9+, iOS 13+ (via Chrome, Safari, or other modern browsers)

## Running Locally

This project is built with Vite, a modern web development build tool.

1.  **Prerequisites:** You need to have Node.js and a package manager (like npm, yarn, or pnpm) installed on your system.

2.  **Installation:**
    -   Open a terminal in the project's root directory.
    -   Install the required dependencies:
        ```bash
        npm install
        ```

3.  **Running the App:**
    -   Start the Vite development server:
        ```bash
        npm run dev 
        ```
        (If you do not have a `package.json` with a `dev` script, you can run Vite directly with `npx vite`)
    -   Open your web browser and navigate to the local URL provided in the terminal (e.g., `http://localhost:5173`).

    **Note on Features:** Browser features like **voice recording** and **geolocation** require a secure (HTTPS) context. The Vite development server typically provides this. If you face issues, you may need to configure a trusted local SSL certificate for your development environment.
