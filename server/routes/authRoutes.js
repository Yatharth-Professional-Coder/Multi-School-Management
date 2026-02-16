const express = require('express');
const router = express.Router();
const { loginUser, registerUser, forgotPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/change-password', protect, changePassword);

module.exports = router;
