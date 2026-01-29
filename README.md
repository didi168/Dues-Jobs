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
- Node.js (v18+)
- Yarn
- Supabase Project

### 1. Backend Setup

```bash
cd server
yarn install
# Create .env from .env.example and configure Supabase credentials
yarn dev
```
Runs on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd client
yarn install
# Create .env from .env.example
yarn dev
```
Runs on `http://localhost:5173`.

## 📄 License
[MIT](LICENSE)
