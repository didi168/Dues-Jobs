# Dues-Jobs Frontend

React.js (Vite) client for the Dues-Jobs SaaS.

## Features

- **Authentication**: Supabase Auth (Email/Password).
- **Dashboard**: View daily job matches, filter, and refresh.
- **Actions**: Mark jobs as Applied/Ignored optimistically.
- **Settings**: Configure Job Preferences (Keywords, Location, etc.) and Notifications.
- **History**: View past job interactions.

## Setup

1. **Install Dependencies**

   ```bash
   cd client
   yarn
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your Supabase credentials.
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

## Development

Start the development server (proxies API requests to `localhost:5000`):

```bash
yarn dev
```

## Build

Build for production:

```bash
yarn build
```
