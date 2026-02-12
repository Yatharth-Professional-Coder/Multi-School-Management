const School = require('../models/School');
const User = require('../models/User');

// @desc    Create a new school
// @route   POST /api/schools
// @access  Private/SuperAdmin
const createSchool = async (req, res) => {
    const { name, address, contact, subscriptionPlan, adminEmail, adminName, adminPassword } = req.body;

    try {
        // 1. Create the School
        const school = await School.create({
            name,
            address,
            contact,
            subscriptionPlan,
        });

        // 2. Create the Admin (Principal) for this school
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword, // Will be hashed by pre-save hook
            role: 'Admin',
            schoolId: school._id,
        });

        // 3. Link Admin to School
        school.adminId = admin._id;
        await school.save();

        res.status(201).json({
            message: 'School and Admin created successfully',
            school,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all schools
// @route   GET /api/schools
// @access  Private/SuperAdmin
const getSchools = async (req, res) => {
    try {
        const schools = await School.find().populate('adminId', 'name email');
        res.json(schools);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSchool = async (req, res) => {
    const { name, address, contact, subscriptionPlan } = req.body;
    try {
        const school = await School.findById(req.params.id);
        if (school) {
            school.name = name || school.name;
            school.address = address || school.address;
            school.contact = contact || school.contact;
            school.subscriptionPlan = subscriptionPlan || school.subscriptionPlan;

            const updatedSchool = await school.save();
            res.json(updatedSchool);
        } else {
            res.status(404).json({ message: 'School not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createSchool, getSchools, updateSchool };
