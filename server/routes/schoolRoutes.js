const express = require('express');
const router = express.Router();
const { createSchool, getSchools, updateSchool, deleteSchool, approveSchool, rejectSchool, updateSchoolSettings } = require('../controllers/schoolController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, superAdmin, createSchool)
    .get(protect, superAdmin, getSchools);

router.route('/:id')
    .put(protect, superAdmin, updateSchool)
    .delete(protect, superAdmin, deleteSchool);

router.put('/:id/approve', protect, superAdmin, approveSchool);
router.delete('/:id/reject', protect, superAdmin, rejectSchool);
router.put('/:id/settings', protect, superAdmin, updateSchoolSettings);

router.post('/register', createSchool); // Public registration for new schools

module.exports = router;
