const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
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
  console.log(`Server running on http://localhost:${PORT}`);
  telegramBot.start();
});

module.exports = app;
