// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, createStaff } = require('../controllers/authController');
const { protect, authorise } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);
router.post('/create-staff', protect, authorise('admin'), createStaff);

module.exports = router;
