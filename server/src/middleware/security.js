const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const security = (app) => {
  const origins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',');
  app.use(
    cors({
      origin: origins,
      credentials: true
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
