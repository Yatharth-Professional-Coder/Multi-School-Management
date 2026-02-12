const express = require('express');
const router = express.Router();
const { createSchool, getSchools, updateSchool, deleteSchool } = require('../controllers/schoolController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, superAdmin, createSchool)
    .get(protect, superAdmin, getSchools);

router.route('/:id')
    .put(protect, superAdmin, updateSchool)
    .delete(protect, superAdmin, deleteSchool);

router.post('/register', createSchool); // Public registration for new schools

module.exports = router;
