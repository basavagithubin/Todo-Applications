const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { register, login, logout, profile, refresh } = require('../controllers/auth.controller');
const router = express.Router();

router.post(
  '/register',
  [
    body('name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  register
);
router.post('/login', [body('email').isEmail(), body('password').isLength({ min: 6 })], login);
router.post('/logout', logout);
router.get('/profile', auth, profile);
router.post('/refresh', refresh);

module.exports = router;
