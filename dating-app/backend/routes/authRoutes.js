const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { generateToken } = require('../utils/authUtils');
const authMiddleware = require('../middlewares/authMiddleware');

// Local Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:id/:token', authController.resetPassword);

// Google Auth routes
// 1. Redirect to Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// 2. Callback from Google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    session: false, // We will use JWT, not sessions
  }),
  (req, res) => {
    // Successful authentication, generate token and redirect
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth-success.html?token=${token}`);
  }
);

module.exports = router;