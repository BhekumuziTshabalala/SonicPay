# SonicPay — Front-End (React + Vite)

Light-weight React front-end for the SonicPay demo project. The UI uses a light, glass-like aesthetic and includes a small admin gate that must be unlocked before using registration or login flows.

Key features

- Glass-like light UI with good UX for onboarding and forms
- Admin gate overlay: requires admin email/password before the app is available (default demo: admin@admin.com / admin). The unlock is persisted in localStorage so you won't be asked again on the same browser.
- Authentication integration with the backend at /api/auth/* (login, register, me, logout)

Getting started

Prerequisites

- Node.js 18+ and npm (or yarn)
- Backend server running (see repository root Backend/README or the Backend folder). If backend is not available you can still explore the UI and login locally with the demo admin account.

Install

1. From the repo root open the front-end folder:
   cd Front-End
2. Install dependencies:
   npm install

Run locally

Start the Vite dev server:

   npm run dev

By default the app will try to contact the backend at the same origin (/api/...). If you run the backend on a separate host/port, either start Vite with a proxy configured in `vite.config.js` or set the API base URL in your environment.

Admin gate

Before you can register or log in, the front-end shows an Admin gate modal. This is a local UI gate (not a backend check) intended for demo/testing flows. Use the default demo credentials:

- Email: admin@admin.com
- Password: admin

The admin unlock is stored in localStorage under `sonicpay.adminUnlocked`. To reset the gate, clear localStorage for the site.

Offline demo mode

If the backend is not running you can still:

- Unlock the app with the admin demo account and use the UI flows (forms will attempt to call the backend but will fail gracefully and show errors in the UI)
- Use the Fill Demo button in Admin gate to populate credentials quickly

Authentication

The front-end calls these backend routes (expected):

- POST /api/auth/login — { email, password }
- POST /api/auth/register — { name, email, password, roles }
- GET /api/auth/me — returns current user session
- POST /api/auth/logout — sign out

Testing

- Manual: run the dev server (npm run dev) and use the UI in browser.
- Automated (quick demo): a small test is included using Vitest + Testing Library. Run:

   npm run test

This will run a minimal component test that checks the Admin gate renders.

Notes

- The Admin gate is a front-end-only convenience for the demo. Remove or replace with a real admin authentication flow for production.
- The UI expects the backend to return user objects on login/register and should use HTTP status codes to indicate failures.

License and contribution

This project is MIT-licensed. Feel free to open issues or submit PRs.
