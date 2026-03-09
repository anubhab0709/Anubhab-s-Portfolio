# Frontend Portfolio (React)

Production-ready frontend created with React + Vite.

## Environment Variables

Create `.env` from `.env.example` and configure:

- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Web Client ID
- `VITE_API_BASE_URL` - backend API base URL (example: `http://localhost:8080/api/v1`)
- `VITE_CALCOM_BOOKING_URL` - booking page URL

For production:

```bash
cp .env.production.example .env
```

Set `VITE_API_BASE_URL` to your deployed backend URL, for example: `https://api.yourdomain.com/api/v1`.

The floating chatbot in the home page uses `POST /chat` on the backend base URL. Make sure backend `OPENAI_API_KEY` is configured.

## Scripts

- `npm install` - install dependencies
- `npm run dev` - run local dev server
- `npm run build` - create production build in `dist/`
- `npm run preview` - preview production build locally

## Structure

- `src/components/` - reusable layout/common components
- `src/sections/` - page sections (hero, about, skills, etc.)
- `src/data/` - centralized portfolio content
- `src/styles/` - global and page styling
- `src/hooks/` - shared React hooks

You can deploy `dist/` to Netlify, Vercel, GitHub Pages, or any static host.
