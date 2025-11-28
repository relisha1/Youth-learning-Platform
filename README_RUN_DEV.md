# Quick dev runner

Double-click `run-dev.bat` in the project root to start both the backend and frontend development servers and open the frontend in your browser.

What the script does:
- Stops any process listening on ports `5000` and `3000` (if any).
- Starts the backend in a new PowerShell window and runs `npm install` then `npm start`.
- Starts the frontend in a new PowerShell window and runs `npm install` then `npm run dev`.
- Opens `http://localhost:3000` in your default browser.

Notes:
- This is intended for local development only.
- If you get warnings about script execution policies, use the included `run-dev.bat` which calls PowerShell with `-ExecutionPolicy Bypass`.
- If anything still doesn't work, open the backend PowerShell window and look for errors in the server logs; paste the first 20 lines here and I'll help diagnose.
