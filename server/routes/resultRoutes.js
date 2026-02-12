const express = require('express');
const router = express.Router();
const { addResult, getResults } = require('../controllers/resultController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addResult)
    .get(protect, getResults);

module.exports = router;
