# Putting the website online

The backend also serves the website, so you only host **one** thing. The data is in one SQLite file,
so the host must keep a disk for it. If the disk is lost, all users and certificates are lost.

## Option 1: a quick link from your own computer (for a demo)

Good for showing your coach or a few friends today. The link only works while your computer is on.

1. Build the website:
   ```
   cd Frontend
   npm install
   npm run build
   ```
2. Start the backend (it finds the built website by itself):
   ```
   cd ../Backend
   npm start
   ```
   Open http://localhost:5000. It is the full website on one address.
3. Make a public link with a tunnel. Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) and run:
   ```
   cloudflared tunnel --url http://localhost:5000
   ```
   It prints a link that ends with `trycloudflare.com`. Anyone can open it.

## Option 2: Fly.io (stays online, keeps the data)

Fly.io needs a card and costs a small amount every month, so check https://fly.io/docs/about/pricing/ first.
The settings are already in `fly.toml` and the `Dockerfile`.

1. Install `flyctl` and log in: https://fly.io/docs/flyctl/install/
   ```
   fly auth login
   ```
2. In the project folder, make the app (use your own name, then change `app = ...` in `fly.toml` to the same name):
   ```
   fly launch --no-deploy --copy-config --name your-app-name
   ```
3. Make the disk for the database (keep only ONE machine, because the disk belongs to one machine):
   ```
   fly volumes create data --size 1 --region jnb
   ```
4. Set your secrets (use your own values; get a secret with `npm run secret` in the Backend folder):
   ```
   fly secrets set JWT_SECRET=paste-the-long-secret ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=choose-a-strong-password CLIENT_URL=https://your-app-name.fly.dev
   ```
5. Put it online:
   ```
   fly deploy
   ```
   Your site is at `https://your-app-name.fly.dev`.

To update later: `git pull`, then `fly deploy` again.

## Option 3: other hosts

Any host that runs Docker or Node 22.13+ and gives you a **persistent disk** works. Set the same
environment variables (`JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) and point `DB_PATH` to a file on the disk.
Free plans that sleep or have no disk (for example the free Render web service) will lose your data, so do not use them for real learners.

## Before real learners use it

- Use a strong `ADMIN_PASSWORD` and a new `JWT_SECRET` (never the one from testing).
- Back up the database file now and then. On Fly.io: `fly ssh sftp get /data/youth-hub.db`.
- Add SMS or email keys (see `Backend/.env.example`) if you want messages to be sent.
