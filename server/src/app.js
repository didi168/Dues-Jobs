const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? 'prod.env' : 'dev.env';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

// Also load standard .env as fallback if dev.env/prod.env aren't found or for common variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

const whitelist = [
  'http://localhost:5173',
  'https://dues-jobs.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());

// Routes
const fetchRoutes = require('./routes/fetch');
const jobsRoutes = require('./routes/jobs');
const usersRoutes = require('./routes/users');

app.use('/api/v1/fetch', fetchRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/users', usersRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const telegramBot = require('./services/TelegramBotHandler');

app.listen(PORT, () => {
  const serverUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  console.log(`Server running on ${serverUrl}`);
  telegramBot.start();
});

module.exports = app;
