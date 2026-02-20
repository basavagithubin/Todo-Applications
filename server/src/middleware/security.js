const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const security = (app) => {
  const staticOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (staticOrigins.includes(origin)) return true;
    try {
      const { hostname } = new URL(origin);
      if (hostname.endsWith('.vercel.app')) return true;
    } catch (_) {}
    return false;
  };
  app.use(
    cors({
      origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );
  app.use(helmet());
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000), 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
  });
  app.use(limiter);
};

module.exports = { security };
