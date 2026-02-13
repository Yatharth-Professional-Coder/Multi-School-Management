const express = require('express');
const router = express.Router();
const { addUser, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, staff, addUser)
    .get(protect, staff, getUsers);

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, updateUser)
    .delete(protect, admin, deleteUser);

module.exports = router;
