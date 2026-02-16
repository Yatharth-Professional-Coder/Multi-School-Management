const express = require('express');
const router = express.Router();
const { addResult, getResults, addBulkResults } = require('../controllers/resultController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addResult)
    .get(protect, getResults);

router.post('/bulk', protect, addBulkResults);

module.exports = router;
