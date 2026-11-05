# Youth Learning Platform

A web platform that helps young people in Rwanda go from learning tech skills to getting jobs.

Learners follow tutorials and get a certificate with a code when they finish one. Employers
(partners) post jobs and internships, read applications, and can check any certificate code
to make sure it is real.

## Parts
- `Backend/` - Node and Express server. Data is saved in a JSON file, so no database is needed.
- `Frontend/` - React app made with Vite.

## Roles
- **student** - does tutorials, gets certificates, applies for jobs
- **mentor** - the facilitator (their own pages are not finished yet)
- **partner** - the employer: posts jobs, reads applications, checks certificates
- **admin** - manages users, tutorials and jobs at `/admin`

Only student, mentor and partner can be picked when registering. Admin is made from the `.env` file.

## How to run

1. Install Node.js from https://nodejs.org

2. Backend:
```
cd Backend
npm install
cp .env.example .env
```
Run `npm run secret` to make a new random secret. Open `.env`, paste it as `JWT_SECRET`, and set your own `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
The server will not start if the secret is missing or too short.
Then start it:
```
npm start
```
The first time it runs it makes the database file with a few sample tutorials and jobs,
and creates the admin account from your `.env`.

3. Frontend (in a new terminal):
```
cd Frontend
npm install
npm run dev
```
Open http://localhost:3000

## Main pages
- `/tutorials` - tutorials, press "I finished this tutorial" to get a certificate
- `/my-certificates` - your certificates and your job applications
- `/jobs` - open jobs, students can apply
- `/partner` - employer page
- `/verify` - anyone can check a certificate code
- `/admin` - admin page

## Notes
- Never upload the `.env` file or `Backend/data/database.json` (they are in `.gitignore`).
- Right now a student can mark a tutorial as finished by clicking the button. Later this should
  be checked by a facilitator or a quiz so the certificates mean more to employers.
