const express = require('express');
const router = express.Router();
const {
    createTimetableEntry,
    getClassTimetable,
    getTeacherTimetable,
    updateTimetableEntry,
    deleteTimetableEntry
} = require('../controllers/timetableController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createTimetableEntry);

router.route('/:id')
    .put(protect, admin, updateTimetableEntry)
    .delete(protect, admin, deleteTimetableEntry);

router.route('/class/:classId')
    .get(protect, getClassTimetable);

router.route('/teacher/:teacherId')
    .get(protect, staff, getTeacherTimetable);

module.exports = router;
