const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const security = (app) => {
  const corsOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true
    })
  );
  app.use(helmet());
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use(limiter);
};

module.exports = { security };
