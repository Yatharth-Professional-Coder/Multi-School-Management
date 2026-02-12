const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, requestRectification, approveRectification, getPendingRectifications, getClassAttendance } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, markAttendance); // Teachers/Admins mark attendance

// Define specific routes first
router.route('/rectify')
    .put(protect, requestRectification); // Student/Teacher requests

router.route('/rectify/approve')
    .put(protect, admin, approveRectification); // Principal approves

router.route('/pending')
    .get(protect, admin, getPendingRectifications); // Admin views pending

// Define parameterized route last
router.route('/class/:classId')
    .get(protect, getClassAttendance); // Class wise attendance

router.route('/:userId')
    .get(protect, getAttendance); // View attendance

module.exports = router;
