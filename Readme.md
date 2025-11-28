# Youth Learning Platform

A full-stack web application for learning and managing educational content. The platform includes user authentication, an admin dashboard for managing tutorials and internships, and a student interface for browsing courses.

## Overview

- **Backend**: Node.js + Express server using a JSON file (`Backend/data/database.json`) as the data store (no external database required)
- **Frontend**: React app built with Vite
- **Authentication**: JWT-based with bcrypt password hashing
- **Development Mode**: Auto-login feature for easier testing (disabled in production)

## Prerequisites

- **Node.js (LTS)** — Install from https://nodejs.org (includes `npm`)
- **Terminal** — PowerShell on Windows or any terminal on macOS/Linux
- **Git** (optional, if cloning the repository)

## Project Structure

```
Youth-learning-Platform/
├── Backend/
│   ├── data/
│   │   └── database.json          # JSON database file with users, tutorials, internships
│   ├── middleware/
│   │   └── auth.js                # JWT authentication middleware
│   ├── models/
│   │   ├── User.js                # User model
│   │   └── database.js            # Database operations
│   ├── routes/
│   │   ├── admin.js               # Admin dashboard endpoints
│   │   ├── auth.js                # Login/registration endpoints
│   │   ├── public.js              # Public endpoints
│   │   └── dev.js                 # Development helpers
│   ├── .env                       # Environment variables (JWT_SECRET, PORT, NODE_ENV)
│   ├── server.js                  # Express server entry point
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx # Admin management interface
│   │   │   ├── Dashboard.jsx      # Student dashboard
│   │   │   ├── Home.jsx           # Home page
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration page
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api.js             # API client for user endpoints
│   │   │   └── adminAPI.js        # API client for admin endpoints
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global authentication state
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
└── Readme.md
```

## Quick Start (Windows / PowerShell)

### 1. Clone and Navigate to Project

```powershell
git clone https://github.com/<your-username>/Youth-learning-Platform.git
cd Youth-learning-Platform
```

### 2. Install Dependencies

```powershell
# Install backend dependencies
cd .\Backend
npm install

# Install frontend dependencies
cd ..\Frontend
npm install
cd ..
```

### 3. Start the Backend (Terminal 1)

```powershell
cd .\Backend
npm run dev
```

You should see:
```
Server running at http://localhost:5000
JWT_SECRET present at startup: true
Created default admin (admin@local.test)
```

### 4. Start the Frontend (Terminal 2)

```powershell
cd .\Frontend
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:3000/
```

### 5. Access the Website

Open your browser and navigate to:
- **Main website**: http://localhost:3000

The backend will automatically be running on `http://localhost:5000` and is configured for CORS.

## Accessing the Admin Dashboard

### Option 1: Dev Mode Auto-Login (Recommended for Development)

In **development mode** (default), the admin dashboard automatically logs in the first admin user when you access it without requiring a token.

1. Navigate to the **Admin Dashboard** from the website's menu or go directly to: `http://localhost:3000/admin`
2. The dashboard will auto-populate with admin data (users, tutorials, internships, applications)
3. You can now:
   - **View all users** — See registered users and their roles
   - **Manage tutorials** — Add, delete tutorials with categories and levels
   - **Manage internships** — Add, delete internships with company and duration info
   - **View applications** — Track student applications to internships

### Option 2: Manual Login

If auto-login is disabled or in production, log in with default credentials:

**Email**: `admin@local.test`  
**Password**: `admin1234`

## Available User Accounts for Testing

The database comes pre-populated with test users. You can log in with any of these:

| Email | Password | Role |
|-------|----------|------|
| admin@local.test | admin1234 | Admin |
| john@example.com | admin1234 | Student |
| sarah@example.com | admin1234 | Student |
| alex@mentor.com | admin1234 | Mentor |
| company@techcorp.com | admin1234 | Partner |

You can also create new accounts through the **Register** page.

## Configuration

### Backend Environment Variables

Edit `Backend/.env` to customize:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
DB_PATH=./data/database.json
```

- **NODE_ENV**: Set to `production` to disable dev auto-login
- **JWT_SECRET**: Used to sign authentication tokens
- **PORT**: Backend server port
- **DB_PATH**: Location of JSON database file

### Frontend Configuration

Edit `Frontend/src/services/api.js` to change the backend URL (defaults to `http://localhost:5000`):

```javascript
const API_URL = 'http://localhost:5000/api';
```

## Features

### Authentication
- User registration with email and password
- JWT token-based authentication
- Bcrypt password hashing with 10 salt rounds
- Development mode auto-login for easy testing

### Admin Dashboard
- **Users tab**: View and delete users, manage roles
- **Tutorials tab**: Add/delete tutorials, filter by category and level
- **Internships tab**: Add/delete internships with company and duration
- **Applications tab**: View and manage student applications

### Student Features
- Browse available tutorials
- View and apply to internships
- Track personal progress
- Access mentor resources

## Database

Data is stored in `Backend/data/database.json` with the following structure:

```json
{
  "users": [...],
  "tutorials": [...],
  "internships": [...],
  "applications": [...],
  "progress": [...]
}
```

**No external database setup required** — everything runs locally.

## Common Tasks

### Adding a Tutorial

1. Go to **Admin Dashboard** → **Tutorials tab**
2. Fill in the form:
   - **Title**: Tutorial name
   - **Description**: Brief description
   - **Category**: Programming, Web Development, etc.
   - **Level**: Beginner, Intermediate, or Advanced
3. Click **Add Tutorial**
4. Tutorial appears in the list immediately

### Adding an Internship

1. Go to **Admin Dashboard** → **Internships tab**
2. Fill in the form:
   - **Title**: Internship position title
   - **Company**: Company name
   - **Description**: Job description
   - **Duration**: Length of internship (e.g., "3 months")
3. Click **Add Internship**
4. Internship appears in the list immediately

### Viewing and Managing Users

1. Go to **Admin Dashboard** → **Users tab**
2. See all registered users and their roles
3. Click **Delete** to remove a user

## Troubleshooting

### Backend won't start / "Port 5000 already in use"
```powershell
# Find and stop the process using port 5000
Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Force
```

### Frontend won't load / "Network Error"
- Ensure backend is running on port 5000
- Check that `Frontend/src/services/api.js` has correct backend URL
- Try refreshing the page

### Can't access admin dashboard
- Ensure you're logged in as an admin user
- In dev mode, auto-login should work automatically — refresh the page
- Check browser console (F12) for error messages

### Database corrupted
- Delete `Backend/data/database.json`
- Restart the backend — it will recreate the database with defaults

## Deployment Notes

Before deploying to production:

1. Set `NODE_ENV=production` in `Backend/.env`
2. Change `JWT_SECRET` to a strong random string
3. Build the frontend: `cd Frontend && npm run build`
4. Serve the built frontend from the backend or a separate host
5. Update `Frontend/src/services/api.js` to point to production backend URL
6. Disable CORS wildcards in `Backend/server.js` for security

## Technologies Used

- **Backend**: Node.js, Express, JWT, bcryptjs
- **Frontend**: React 18, Vite, Axios, React Router
- **Database**: JSON file
- **Styling**: CSS

## License

This project is for learning purposes.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the browser console (F12) for error messages
3. Check backend server logs for API errors
