const express = require('express');
const router = express.Router();
const { addHomework, getHomework } = require('../controllers/homeworkController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addHomework)
    .get(protect, getHomework);

module.exports = router;
