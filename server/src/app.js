const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const { security } = require('./middleware/security');
const authRoutes = require('./routes/auth.routes');
const todoRoutes = require('./routes/todo.routes');
const adminRoutes = require('./routes/admin.routes');
const { errorHandler, notFound } = require('./middleware/error');
require('dotenv').config();

const app = express();

connectDB();
app.set('trust proxy', 1);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
security(app);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
