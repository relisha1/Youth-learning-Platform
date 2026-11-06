# Youth Learning Platform

A web platform that helps young people in Rwanda go from learning tech skills to getting jobs.

Learners follow tutorials and get a certificate with a code when they finish one. Employers
(partners) post jobs and internships, read applications, and can check any certificate code
to make sure it is real.

## Parts
- `Backend/` - Node and Express server. Data is saved in a JSON file, so no database is needed.
- `Frontend/` - React app made with Vite.

## Roles
- **student** - does tutorials, sends a project, gets a certificate, applies for jobs
- **mentor** - the facilitator: checks the projects students send and approves them
- **partner** - the employer: saves company info, posts jobs, reads applications, checks certificates
- **admin** - manages users, tutorials and jobs at `/admin`

Only student, mentor and partner can be picked when registering. Admin is made from the `.env` file.
Mentors and partners cannot use their pages until an admin approves them (Users tab in `/admin`).

## How a certificate is given
1. The student opens a tutorial and does the project written there.
2. The student sends the link to the project.
3. The facilitator opens the link and checks it. If it is good they press Approve, and the certificate is made.
4. If it is not good, the facilitator writes what to fix and sends it back. The student can send it again.
5. An employer can type the certificate code on `/verify` to see that it is real and who gave it.

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

## Trying different roles
The login stays saved in the browser (the token lasts 7 days). The admin page keeps its own login, so you can
use `/admin` and another role in the same browser. To test two normal roles at the same time (for example a student
and a facilitator), use a normal window for one and an incognito window for the other.

## Main pages
- `/tutorials` - tutorials and the project for each one
- `/my-certificates` - your certificates, projects and job applications
- `/jobs` - open jobs, students can apply
- `/find-mentor` - students ask a facilitator to be their mentor
- `/facilitator` - facilitator page to check projects
- `/mentoring` - facilitators answer mentoring requests and edit their profile
- `/partner` - employer page
- `/verify` - anyone can check a certificate code
- `/admin` - admin page

## Notes
- Never upload the `.env` file or `Backend/data/database.json` (they are in `.gitignore`).
- Change `JWT_SECRET` if it was ever shown or shared. `npm run secret` makes a new one. After changing it everyone has to log in again.
