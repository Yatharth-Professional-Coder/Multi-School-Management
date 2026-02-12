const express = require('express');
const router = express.Router();
const { createSchool, getSchools } = require('../controllers/schoolController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, superAdmin, createSchool)
    .get(protect, superAdmin, getSchools);

module.exports = router;
