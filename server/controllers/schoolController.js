const School = require('../models/School');
const User = require('../models/User');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Announcement = require('../models/Announcement');
const Result = require('../models/Result');
const Homework = require('../models/Homework');

const getPlanFeatures = (plan) => {
    switch (plan) {
        case 'Premium':
            return {
                enableTimetable: true,
                enableAttendance: true,
                enableHomework: true,
                enableResults: true,
                enableAnnouncements: true,
            };
        case 'Standard':
            return {
                enableTimetable: true,
                enableAttendance: true,
                enableHomework: true,
                enableResults: false,
                enableAnnouncements: true,
            };
        case 'Basic':
        default:
            return {
                enableTimetable: false,
                enableAttendance: true,
                enableHomework: false,
                enableResults: false,
                enableAnnouncements: true,
            };
    }
};

// @desc    Create a new school
// @route   POST /api/schools
// @access  Private/SuperAdmin
const createSchool = async (req, res) => {
    const { name, address, contact, subscriptionPlan, adminEmail, adminName, adminPassword } = req.body;

    try {
        const isApproved = req.user && req.user.role === 'SuperAdmin';
        const defaultFeatures = getPlanFeatures(subscriptionPlan || 'Basic');

        // 1. Create the School
        const school = await School.create({
            name,
            address,
            contact,
            subscriptionPlan: subscriptionPlan || 'Basic',
            isApproved: isApproved,
            settings: {
                features: defaultFeatures
            }
        });

        // 2. Create the Admin (Principal) for this school
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
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
            const oldPlan = school.subscriptionPlan;
            school.name = name || school.name;
            school.address = address || school.address;
            school.contact = contact || school.contact;
            school.subscriptionPlan = subscriptionPlan || school.subscriptionPlan;

            // If plan changed, reset features to new plan defaults
            if (subscriptionPlan && subscriptionPlan !== oldPlan) {
                school.settings.features = getPlanFeatures(subscriptionPlan);
                // Also reset grading system for non-premium
                if (subscriptionPlan !== 'Premium') {
                    school.settings.gradingSystem = 'Percentage';
                }
            }

            const updatedSchool = await school.save();
            res.json(updatedSchool);
        } else {
            res.status(404).json({ message: 'School not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteSchool = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (school) {
            const schoolId = school._id;

            await User.deleteMany({ schoolId });
            await Class.deleteMany({ schoolId });
            await Section.deleteMany({ schoolId });
            await Attendance.deleteMany({ schoolId });
            await Timetable.deleteMany({ schoolId });
            await Announcement.deleteMany({ schoolId });
            await Result.deleteMany({ schoolId });
            await Homework.deleteMany({ schoolId });

            await school.deleteOne();
            res.json({ message: 'School and all associated data removed successfully' });
        } else {
            res.status(404).json({ message: 'School not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveSchool = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (school) {
            school.isApproved = true;
            await school.save();
            res.json({ message: 'School approved successfully', school });
        } else {
            res.status(404).json({ message: 'School not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const rejectSchool = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (school) {
            const schoolId = school._id;

            await User.deleteMany({ schoolId });
            await Class.deleteMany({ schoolId });
            await Section.deleteMany({ schoolId });
            await Attendance.deleteMany({ schoolId });
            await Timetable.deleteMany({ schoolId });
            await Announcement.deleteMany({ schoolId });
            await Result.deleteMany({ schoolId });
            await Homework.deleteMany({ schoolId });

            await school.deleteOne();
            res.json({ message: 'School registration rejected and all associated data removed' });
        } else {
            res.status(404).json({ message: 'School not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSchoolSettings = async (req, res) => {
    const { themeColor, logoUrl, gradingSystem, features } = req.body;
    try {
        const school = await School.findById(req.params.id);
        if (school) {
            const planFeatures = getPlanFeatures(school.subscriptionPlan);

            // Enforce plan-based feature limits
            const restrictedFeatures = features ? { ...features } : { ...school.settings.features };
            Object.keys(planFeatures).forEach(key => {
                if (planFeatures[key] === false) {
                    restrictedFeatures[key] = false;
                }
            });

            school.settings = {
                themeColor: themeColor || school.settings.themeColor,
                logoUrl: logoUrl !== undefined ? logoUrl : school.settings.logoUrl,
                gradingSystem: (school.subscriptionPlan === 'Premium' ? (gradingSystem || school.settings.gradingSystem) : 'Percentage'),
                features: restrictedFeatures
            };

            const updatedSchool = await school.save();
            res.json(updatedSchool);
        } else {
            res.status(404).json({ message: 'School not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createSchool, getSchools, updateSchool, deleteSchool, approveSchool, rejectSchool, updateSchoolSettings };
