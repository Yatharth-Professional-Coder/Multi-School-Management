const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');

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

        // Validate allowed roles based on requester
        let allowedRoles = [];
        if (req.user.role === 'Admin') {
            allowedRoles = ['Teacher', 'SubAdmin', 'Parent']; // Admin cannot create Student
        } else if (req.user.role === 'SubAdmin') {
            allowedRoles = ['Student']; // SubAdmin can only create Student
        } else if (req.user.role === 'SuperAdmin') {
            allowedRoles = ['Admin', 'Teacher', 'Student', 'SubAdmin', 'Parent'];
        } else if (req.user.role === 'Teacher') {
            allowedRoles = ['Student']; // Teacher can create Student
        }

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: `Role '${req.user.role}' is not authorized to create '${role}' accounts` });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            schoolId,
            childId: req.body.childId || null,
            studentClass: req.body.classId || null,
            parentEmail: req.body.parentEmail || ''
        });

        res.status(201).json({
            _id: user._id,
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
    const { role, classId } = req.query; // Optional filters

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

        if (classId) {
            query.studentClass = classId;
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
    const { name, email, password, role, parentEmail } = req.body;
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Permission check: 
            let canUpdate = false;

            if (req.user.role === 'SuperAdmin') {
                canUpdate = true;
            } else if (req.user.role === 'Admin') {
                // Admin can update users in their school, except SuperAdmins and other Admins
                if (user.schoolId?.toString() === req.user.schoolId?.toString() &&
                    ['SubAdmin', 'Teacher', 'Student', 'Parent'].includes(user.role)) {
                    canUpdate = true;
                }
            } else if (req.user.role === 'Teacher') {
                // Teacher can update Students in their school
                if (user.schoolId?.toString() === req.user.schoolId?.toString() && user.role === 'Student') {
                    canUpdate = true;
                }
            } else if (req.user._id.toString() === user._id.toString()) {
                // Users can update their own basic info (except role usually)
                canUpdate = true;
            }

            if (!canUpdate) {
                return res.status(403).json({ message: 'Not authorized to update this user' });
            }

            // Prevent non-Admins/SuperAdmins from changing roles
            if (role && (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin')) {
                // Silent ignore or error? Let's just not set it.
            } else {
                user.role = role || user.role;
            }

            user.name = name || user.name;
            user.email = email || user.email;
            if (parentEmail !== undefined) {
                user.parentEmail = parentEmail;
            }
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

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Prevent deleting self
            if (user._id.toString() === req.user._id.toString()) {
                return res.status(400).json({ message: 'Cannot delete yourself' });
            }

            // Only Admin/SuperAdmin can delete
            if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
                return res.status(403).json({ message: 'Not authorized to delete users' });
            }

            const userId = user._id;

            // Cascading Delete: Remove all data associated with this user
            if (user.role === 'Student') {
                await Attendance.deleteMany({ studentId: userId });
                await Result.deleteMany({ studentId: userId });
            } else if (user.role === 'Teacher') {
                // Remove attendance records marked by this teacher or where they are the subject teacher
                await Attendance.deleteMany({ teacherId: userId });
            }

            await user.deleteOne();
            res.json({ message: `User (${user.role}) and all associated records removed` });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addUser, getUsers, getUserById, updateUser, deleteUser };
