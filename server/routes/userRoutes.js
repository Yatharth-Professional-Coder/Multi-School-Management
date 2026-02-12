const express = require('express');
const router = express.Router();
const { addUser, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, addUser)
    .get(protect, admin, getUsers);

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, updateUser)
    .delete(protect, admin, deleteUser);

module.exports = router;
