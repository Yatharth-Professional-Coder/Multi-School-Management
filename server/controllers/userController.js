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
    let schoolId = req.user.schoolId;
    const { role } = req.query; // Optional filter by role

    // Allow SuperAdmin to view users of any school if schoolId is provided in query
    if (req.user.role === 'SuperAdmin' && req.query.schoolId) {
        schoolId = req.query.schoolId;
    }

    try {
        let query = { schoolId };
        // If SuperAdmin doesn't provide schoolId, maybe show all? Or require it?
        // Let's assume if schoolId is undefined (SuperAdmin without school), show all?
        // But users belong to school.
        if (!schoolId && req.user.role === 'SuperAdmin') {
            delete query.schoolId; // Show all users across all schools if no specific school requested
        }

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
            const isAdmin = req.user.role === 'Admin' || req.user.role === 'SuperAdmin';
            const isParentOfChild = req.user.role === 'Parent' && req.user.childId && req.user.childId.toString() === user._id.toString();

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

const updateUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Permission check: Admin/SuperAdmin can update users. 
            // Self update logic is separate usually but let's allow Admin for now.
            if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
                return res.status(403).json({ message: 'Not authorized to update user' });
            }

            user.name = name || user.name;
            user.email = email || user.email;
            user.role = role || user.role;
            if (password) {
                user.password = password; // Will be hashed by pre-save hook
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                schoolId: updatedUser.schoolId
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { addUser, getUsers, getUserById, updateUser };
