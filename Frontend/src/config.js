// Where the backend is.
// While you work on your computer it is on port 5000.
// When the website is online, the backend serves the website too, so the address is just /api.
// You can also set VITE_API_URL in a .env file in the Frontend folder to use another address.
export const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
