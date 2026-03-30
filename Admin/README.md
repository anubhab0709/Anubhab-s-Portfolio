# Portfolio Admin

React admin panel for managing portfolio content and moderation tasks.

## Features

- Admin login with Google Sign-In (allowlisted via backend `ADMIN_EMAILS`)
- Manage projects: add, edit, delete
- Manage social links: add, edit, delete
- Manage CV/resume links: add, edit, delete, set primary
- Moderate guest messages: search, hide/unhide, delete
- Manage contact inbox: search, mark read/unread, delete

## Prerequisites

- Backend running at `http://localhost:8080` (or another URL)
- Your admin email must be included in backend `ADMIN_EMAILS`
- Backend `CORS_ORIGINS` must include `http://localhost:5174`
- Set `VITE_GOOGLE_CLIENT_ID` for the Admin app

## Run

```bash
cd Admin
npm install
npm run dev
```

Open `http://localhost:5174`.

## Backend Endpoints Used

- `POST /api/v1/auth/google`
- `GET /api/v1/admin/content`
- `PUT /api/v1/admin/content`
- `GET /api/v1/admin/guestbook`
- `PATCH /api/v1/admin/guestbook/:entryId/visibility`
- `DELETE /api/v1/admin/guestbook/:entryId`
- `GET /api/v1/admin/contacts`
- `PATCH /api/v1/admin/contacts/:messageId/read`
- `DELETE /api/v1/admin/contacts/:messageId`
