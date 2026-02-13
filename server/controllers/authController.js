const User = require('../models/User');
const School = require('../models/School');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).populate('schoolId');

        if (user && (await user.matchPassword(password))) {
            // Check if school is approved (SuperAdmin bypass)
            if (user.role !== 'SuperAdmin') {
                if (!user.schoolId) {
                    return res.status(403).json({ message: 'User is not associated with any school' });
                }
                if (!user.schoolId.isApproved) {
                    return res.status(403).json({
                        message: 'School pending approval. Please contact support.',
                        isPending: true
                    });
                }
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                schoolId: user.schoolId?._id,
                schoolSettings: user.schoolId?.settings,
                childId: user.childId,
                studentClass: user.studentClass,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user (For initial setup/testing)
// @route   POST /api/auth/register
// @access  Public (Should be restricted in production)
const registerUser = async (req, res) => {
    const { name, email, password, role, schoolId } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            schoolId
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                childId: user.childId,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password (Mock)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    // In a real app, send email with reset token
    res.status(200).json({ message: `Password reset link sent to ${email}` });
}

module.exports = { loginUser, registerUser, forgotPassword };
