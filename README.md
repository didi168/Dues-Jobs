# Dues-Jobs

A full-stack SaaS application for finding and managing daily job opportunities. Dues-Jobs aggregates listings from multiple sources, matches them to user preferences, and provides a sleek dashboard for tracking applications.

## 🚀 Features

- **Automated Job Integration**: Daily fetching and normalization of jobs from various sources.
- **Smart Matching**: personalization engine to match jobs based on user keywords and location.
- **Interactive Dashboard**: React-based UI to view, apply, and track job status.
- **Notifications**: Email and Telegram alerts for new matches.
- **Supabase Integration**: Secure authentication and real-time database capabilities.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Vanilla CSS (Supabase Theme).
- **Backend**: Node.js, Express, Supabase (Postgres).
- **Infrastructure**: Docker, Render.com (Web Service + Cron).

## 📂 Project Structure

- **`/client`**: React.js frontend application.
- **`/server`**: Node.js backend API and cron workers.

## 🏁 Getting Started

### Prerequisites

- Node.js (v20+)
- Yarn
- Supabase Project

### 1. Unified Development

You can run both the frontend and backend simultaneously from the root directory:

```bash
# Install all dependencies
yarn install:all

# Run both in development mode
yarn dev
```

### 2. Environment Configuration

The project uses multiple environment files for different stages.

- **Backend (`/server`)**: Uses `dev.env` (local) and `prod.env` (production). The server entry point (`app.js`) automatically selects the correct file based on `NODE_ENV`. For local development, ensure a `.env` file exists (e.g., `cp dev.env .env`).
- **Frontend (`/client`)**: Uses `dev.env` and `prod.env`. For local development with Vite, ensure a `.env` file exists (e.g., `cp dev.env .env`).

### 3. Scripts

- `yarn install:all`: Installs dependencies for both workspace locations.
- `yarn dev`: Starts the Vite dev server and the Express server concurrently.
- `yarn build:client`: Builds the frontend for production.

## 📄 License

[MIT](LICENSE)
