const User = require('../models/User');
const School = require('../models/School');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

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

// @desc    Forgot Password (OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // Return success even if not found to avoid email enumeration
            return res.status(200).json({ message: `If an account with that email exists, an OTP has been sent.` });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set OTP and expiration (10 minutes)
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        // Send Email
        const message = `
            <h2>Password Reset Code</h2>
            <p>You have requested to reset your password. Here is your 6-digit OTP code:</p>
            <h1 style="color: blue;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Reset OTP - MR. EduEdge Portal',
                html: message
            });
            res.status(200).json({ message: `If an account with that email exists, an OTP has been sent.` });
        } catch (error) {
            user.resetPasswordOtp = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });

            console.error('Email send error:', error);
            res.status(500).json({ message: 'Email could not be sent. Please make sure SMTP is configured.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(oldPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, registerUser, forgotPassword, changePassword, resetPassword };
