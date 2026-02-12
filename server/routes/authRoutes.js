const express = require('express');
const router = express.Router();
const { loginUser, registerUser, forgotPassword } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);

module.exports = router;
