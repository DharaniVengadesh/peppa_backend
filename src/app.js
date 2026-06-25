const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const mobileRoutes = require('./routes/mobile');
const adminRoutes = require('./routes/admin');
const app = express();

app.use(helmet({
  // LAN/dev runs on plain HTTP — do not upgrade asset requests to HTTPS
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      upgradeInsecureRequests: null,
    },
  },
  hsts: false,
  crossOriginOpenerPolicy: false,
}));
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(apiLimiter);

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'peppa-api', status: 'ok' });
});

app.use('/api/v1/mobile', mobileRoutes);
app.use('/api/v1/admin', adminRoutes);

const adminUiPath = path.join(__dirname, '../admin');
app.use('/admin', express.static(adminUiPath));
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(adminUiPath, 'index.html'));
});
app.get('/admin/', (_req, res) => {
  res.sendFile(path.join(adminUiPath, 'index.html'));
});
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
