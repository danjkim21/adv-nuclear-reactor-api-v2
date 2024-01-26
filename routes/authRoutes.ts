const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('../config/passport');
const authController = require('../controller/authController');

router.get('/', authController.getCurrentUser);
router.post(
  '/register',
  authController.checkAlreadyRegistered,
  authController.registerUser,
  passport.authenticate('local'),
  authController.login
);
router.post('/login', passport.authenticate('local'), authController.login);
router.post('/logout', authController.logout);

module.exports = router;
