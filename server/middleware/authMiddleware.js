const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'SuperAdmin' || req.user.role === 'SubAdmin')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin or staff');
    }
};

const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'SuperAdmin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a super admin');
    }
};

const staff = (req, res, next) => {
    if (req.user && ['Admin', 'SuperAdmin', 'SubAdmin', 'Teacher'].includes(req.user.role)) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as staff');
    }
};

module.exports = { protect, admin, superAdmin, staff };
