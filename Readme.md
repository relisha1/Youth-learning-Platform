# Youth Learning Platform

Small full-stack learning project with a lightweight Express backend and a React frontend built with Vite.

## What this code is
- `Backend/` — Node + Express server that uses a JSON file (`Backend/data/database.json`) as its datastore. Contains routes for auth, admin, and public endpoints.
- `Frontend/` — React app (Vite) that consumes the backend API.

This repository is intended for local development and learning — no external database is required.

## Prerequisites (on another PC)
- Install Node.js (LTS) from https://nodejs.org (this provides `node` and `npm`).
- A terminal (PowerShell on Windows). Git is required if you clone the repo.

## Quick setup (Windows / PowerShell)
1. Clone the repository and open a terminal in the project root.

```powershell
git clone https://github.com/<your-username>/Youth-learning-Platform.git
cd Youth-learning-Platform
```

2. Install dependencies for backend and frontend:

```powershell
cd .\Backend
npm install
cd ..\Frontend
npm install
```

3. Start the backend (separate terminal):

```powershell
cd .\Backend
npm run dev
```

4. Start the frontend (another terminal):

```powershell
cd .\Frontend
npm run dev
```

5. Open the frontend at `http://127.0.0.1:3000`. The frontend communicates with the backend at `http://localhost:5000` by default.

## Configuration
- Backend reads environment variables from `Backend/.env`. Default values exist in that file (including `JWT_SECRET` and `PORT`). Review before deploying to production.
- Data is persisted in `Backend/data/database.json`.

## Notes
- The project uses JSON files for persistence so no DB server setup is required for local testing.
- If `node` or `npm` are not found, install Node.js and restart your terminal.

If you want I can add a short CONTRIBUTING or developer guide later. For now this README covers how to run the project locally.
# Youth Learning Platform

This repository contains a simple full-stack web application (Backend + Frontend) used for learning and demos.

Overview
- Backend: lightweight Express server using a JSON file as the data store (no external DB required).
- Frontend: React app built with Vite.

This README consolidates setup and run instructions for Windows (PowerShell).

Prerequisites
- Node.js (LTS) installed and available in PATH (includes `npm`).
- A terminal (PowerShell) with permission to run scripts.

Project layout
- `Backend/` — Express server and data files
- `Frontend/` — Vite + React app
- `run-dev.ps1` — helper script to run both servers (update paths if needed)

Environment
- Backend reads `.env` in `Backend/` for `PORT`, `JWT_SECRET`, `DB_PATH` and other config.

Quick start (Windows / PowerShell)
1. Open PowerShell and navigate to the repository root:

```powershell
cd "C:\\Users\\Elisha\\OneDrive\\Desktop\\Youth-learning-Platform"
```

2. Install dependencies for Backend and Frontend:

```powershell
cd .\\Backend
npm install
cd ..\\Frontend
npm install
```

3. Start Backend (in one terminal):

```powershell
cd .\\Backend
npm run dev
```

4. Start Frontend (in another terminal):

```powershell
cd ..\\Frontend
npm run dev
```

5. Open the app in a browser at `http://127.0.0.1:3000` (Frontend) which talks to Backend at `http://localhost:5000`.

Using `run-dev.ps1` script
- `run-dev.ps1` exists to start both servers but the script contains local paths; edit its `$backendDir` and `$frontendDir` variables to match this repo's `Backend` and `Frontend` paths on your machine before running.

Notes
- The Backend uses a JSON file located at `Backend/data/database.json`. If you need to reset data, stop the server and replace or delete that file.
- The `.env` in `Backend` contains a default `JWT_SECRET`. Change it for production.
- If `node` or `npm` are not found, install Node.js from https://nodejs.org and restart PowerShell.

If you want, I can:
- Update `run-dev.ps1` to use relative repo paths so it works without editing.
- Run the install & start commands here (if you allow me to execute them).

---