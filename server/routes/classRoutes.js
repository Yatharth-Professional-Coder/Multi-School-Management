const express = require('express');
const router = express.Router();
const { createClass, updateClass, createSection, getClasses, getSections } = require('../controllers/classController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createClass) // Admin creates classes
    .get(protect, getClasses); // Teachers need to see classes to mark attendance

router.route('/:id')
    .put(protect, admin, updateClass)
    .delete(protect, admin, deleteClass);

router.route('/sections')
    .post(protect, admin, createSection);

router.route('/:classId/sections')
    .get(protect, getSections);

module.exports = router;
