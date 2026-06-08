require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const professionalRoutes = require('./routes/professionals');
const calendarRoutes = require('./routes/calendar');
const aiRoutes = require('./routes/ai');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Calendar Scheduler API running on port ${PORT}`);
});

module.exports = app;
