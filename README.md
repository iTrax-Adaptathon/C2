# Trace 🌱

A beautifully designed, mobile-first personal carbon footprint tracker. **trace.** helps you monitor your daily emissions from travel, food, and energy use, turning your environmental impact into a visual "Carbon Garden."

## ✨ Features

- **Carbon Garden Dashboard:** A visual 7-day timeline of your footprint. Healthy days sprout green leaves, while high-impact days are marked with warm amber.
- **Streak Tracking:** Build a habit! A built-in streak counter encourages you to log your data every day.
- **Yesterday's Quick Estimate:** Forgot to log yesterday? Easily backfill missing data using a fast 4-box grid system for Travel and Food without losing your streak.
- **Detailed Forecasting:** View 10-week and 6-month projections based on your historical data with Recharts area graphs.
- **Demo Mode:** Built-in "time travel" skip button to instantly advance the app's internal clock by 24 hours for quick demonstration and testing purposes.

## 🚀 Tech Stack

- **Frontend Framework:** React 18 (Hooks, Functional Components)
- **Language:** TypeScript
- **Build Tool:** Vite & ESBuild
- **Styling:** Tailwind CSS
- **Charts & Data Viz:** Recharts
- **Icons:** Lucide React
- **Local Persistence:** Securely stored in browser LocalStorage (`trace-log-v1`)

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

Install the required dependencies:
```bash
npm install
```

### Development 

Start the local development server (with Vite middleware aNd Express):
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### Production Build

Build the application for production (compiles the React app and bundles the server):
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

## 📁 Project Structure

- `src/App.tsx`: Core application file containing state management, view routing, and all UI components.
- `src/index.css`: Global stylesheet containing Tailwind configurations and custom root variables.
- `server.ts`: Express server entry point handling static asset serving and API routing (if applicable).
- `dist/`: Generated output directory for production builds.
