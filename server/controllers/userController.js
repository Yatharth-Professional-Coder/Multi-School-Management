const User = require('../models/User');

// @desc    Add a user (Teacher, Student, SubAdmin)
// @route   POST /api/users
// @access  Private/Admin (Principal)
const addUser = async (req, res) => {
    const { name, email, password, role, classId, sectionId } = req.body;

    // Ensure the requester is an Admin and belongs to the same school
    // The 'protect' middleware adds req.user
    const schoolId = req.user.schoolId;

    if (!schoolId) {
        return res.status(400).json({ message: 'Admin must be associated with a school' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate allowed roles for Admin to create
        const allowedRoles = ['Teacher', 'Student', 'SubAdmin', 'Parent'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role for Admin to create' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            schoolId,
            childId: req.body.childId || null
            // classId, sectionId connection will be handled in Phase 3 mostly but we can store them if User schema has them
            // Currently User schema in step 110 didn't have classId/sectionId explicitly, 
            // but the plan says "Students (Linked to User) -> userId, classId..."
            // For now, we stick to the User model. If we need extra fields, we might need a Profile model or update User.
            // Let's stick to core User fields for now.
        });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get users by school
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const schoolId = req.user.schoolId;
    const { role } = req.query; // Optional filter by role

    try {
        let query = { schoolId };
        if (role) {
            query.role = role;
        }

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            // Permission check: Admin, Teacher (for students), Parent (for child), Self
            const isSelf = req.user._id.toString() === user._id.toString();
            const isAdmin = req.user.role === 'Admin' || req.user.role === 'SuperAdmin'; // SuperAdmin logic might need more check?
            const isParentOfChild = req.user.role === 'Parent' && req.user.childId && req.user.childId.toString() === user._id.toString();
            // Teacher check omitted for simplicity, but could be added: const isTeacher = req.user.role === 'Teacher';

            if (isSelf || isAdmin || isParentOfChild) {
                return res.json(user);
            } else {
                return res.status(403).json({ message: 'Not authorized to view this user profile' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addUser, getUsers, getUserById };
