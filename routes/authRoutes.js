const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

const authController = require('../controller/authController');

router.get('/', authController.getCurrentUser);
router.get('/users', authController.getAllUsers);
router.post(
  '/register',
  authController.checkAlreadyRegistered,
  authController.registerUser,
  passport.authenticate('local'),
  authController.login,
);
router.put('/user', authController.updateUser);
router.patch('/users/:id', authController.updateUserPermissions);
router.post('/login', passport.authenticate('local'), authController.login);
router.post('/logout', authController.logout);

module.exports = router;
