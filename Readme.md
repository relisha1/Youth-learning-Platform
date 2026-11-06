# Youth Learning Platform

A web platform that helps young people in Rwanda go from learning tech skills to getting jobs.

Learners follow a learning path and build a project. A facilitator checks the project, and if it is good the
learner gets a certificate with a code and a QR code. Employers post jobs, read applications, and can check any
certificate to make sure it is real.

## Parts
- `Backend/` - Node and Express server with a SQLite database (built into Node, nothing to install).
- `Frontend/` - React app made with Vite.

## Roles
- **student** - follows learning paths, sends projects, gets certificates, applies for jobs, asks facilitators for mentoring
- **mentor** - the facilitator: checks projects with a checklist, answers mentoring requests, has a profile students can see
- **partner** - the employer: saves company info, posts jobs, reads applications, sees learners with certificates
- **admin** - manages users, tutorials, jobs and sees the pilot report at `/admin`

Only student, mentor and partner can be picked when registering. Admin is made from the `.env` file.
Mentors and partners cannot use their pages until an admin approves them (Users tab in `/admin`).

## How a certificate is given
1. The student opens a learning path, reads the lessons and does the project written there.
2. The student sends the link to the project.
3. The facilitator opens the link and checks it with the checklist. If it is good they press Approve and the certificate is made.
4. If it is not good, the facilitator writes what to fix and sends it back. The student can send it again.
5. The certificate page can be printed or saved as PDF. It has the skills the project showed and a QR code.
6. An employer scans the QR code or types the code on `/verify` to see that it is real and who approved it.

## Learning paths
There are three paths to start with: **C Programming** (low-level), **Web Basics** and **Python for Problem Solving**.
Each one has lessons, a project, a checklist for the facilitator and the skills it proves.
The admin can add more in the Tutorials tab.

## Notifications
People get a notification in the bell on the website when something happens (project checked, new applicant,
mentoring request, account approved). SMS and email are also sent if you add keys in `.env`
(Africa's Talking for SMS, Resend for email). Without keys the website notifications still work.

## Accounts and passwords
- Everyone can edit their name, phone, skills and password on `/profile`.
- "Forgot your password?" on the login page sends a reset link by email (it works for one hour).
  Without email keys the link is printed in the backend window instead, so you can test it.
- When email is on, new users get a link to confirm their email, and an admin cannot approve a facilitator
  or employer before they confirmed it. Employers also must add their company website before posting a job.
- Set `CLIENT_URL` in `.env` to the address of your website so the links in the emails are correct.

## Chat, jobs and hiring
- When a facilitator accepts a mentoring request, both people can talk on `/chat/ID`. The facilitator can finish the mentoring.
- Students can search the jobs and filter them. Employers can search certified learners and send them a message.
- An employer can accept an applicant and later mark them as **hired**. The report counts the hired learners.

## Backups
The server saves a copy of the database in `Backend/data/backups` every day and keeps the last 7.
`npm run backup` makes one now, and the admin Report tab has a **Download database backup** button.

## Pilot report
The admin page has a **Report** tab with the numbers for the pilot: learners, projects, approval rate,
certificates, applications and accepted applicants, and a table per week. It can be downloaded as a CSV file for Excel.

## How to run on your computer

1. Install Node.js **22.13 or newer** from https://nodejs.org

2. Backend:
```
cd Backend
npm install
cp .env.example .env
```
Run `npm run secret` to make a new random secret. Open `.env`, paste it as `JWT_SECRET`, and set your own
`ADMIN_EMAIL` and `ADMIN_PASSWORD`. The server will not start if the secret is missing or too short. Then start it:
```
npm start
```
The first time it runs it makes the database file with the sample jobs and learning paths,
and creates the admin account from your `.env`.
(If you have an old `data/database.json` from the first version, its data is copied in once.)

3. Frontend (in a new terminal):
```
cd Frontend
npm install
npm run dev
```
Open http://localhost:3000

## Putting it online
See `DEPLOY.md`. The backend can also serve the built website, so you can host just one thing.

## Trying different roles
The login stays saved in the browser (the token lasts 7 days). The admin page keeps its own login, so you can
use `/admin` and another role in the same browser. To test two normal roles at the same time (for example a student
and a facilitator), use a normal window for one and an incognito window for the other.

## Main pages
- `/tutorials` - learning paths, lessons and the project for each one
- `/my-certificates` - your certificates, projects and job applications
- `/certificate/CODE` - printable certificate with QR code
- `/jobs` - open jobs, students can apply
- `/find-mentor` - students ask a facilitator to be their mentor
- `/facilitator` - facilitator page to check projects
- `/mentoring` - facilitators answer mentoring requests and edit their profile
- `/chat/ID` - chat between a student and their facilitator
- `/profile` - edit your details and password
- `/partner` - employer page
- `/notifications` - what happened on your account
- `/verify` - anyone can check a certificate code
- `/admin` - admin page and pilot report

## Notes
- Never upload the `.env` file or the `.db` database files (they are in `.gitignore`).
- Change `JWT_SECRET` if it was ever shown or shared. `npm run secret` makes a new one. After changing it everyone has to log in again.
- Login is limited to 10 tries every 15 minutes from one address.
