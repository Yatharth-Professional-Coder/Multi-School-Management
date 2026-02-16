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
                enableHalfDay: true,
            };
        case 'Standard':
            return {
                enableTimetable: true,
                enableAttendance: true,
                enableHomework: true,
                enableResults: false,
                enableAnnouncements: true,
                enableHalfDay: true,
            };
        case 'Basic':
        default:
            return {
                enableTimetable: false,
                enableAttendance: true,
                enableHomework: false,
                enableResults: false,
                enableAnnouncements: true,
                enableHalfDay: true,
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
            school.markModified('settings');
            const updatedSchool = await school.save();
            res.json(updatedSchool);
        } else {
            res.status(404).json({ message: 'School not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getMySchool = async (req, res) => {
    try {
        const school = await School.findById(req.user.schoolId);
        if (school) {
            res.json(school);
        } else {
            res.status(404).json({ message: 'School not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAggregatedSchoolData = async (req, res) => {
    const schoolId = req.params.id;
    try {
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Fetch all users for this school
        const users = await User.find({ schoolId }).select('-password');

        const teachers = users.filter(u => u.role === 'Teacher');
        const students = users.filter(u => u.role === 'Student');

        // Aggregate Teacher Data
        const teacherData = await Promise.all(teachers.map(async (teacher) => {
            const [classes, homework, announcements] = await Promise.all([
                Class.find({ teacherId: teacher._id }).select('className'),
                Homework.countDocuments({ teacherId: teacher._id }),
                Announcement.countDocuments({ postedBy: teacher._id })
            ]);

            // Attendance of teacher (if applicable - usually teachers mark attendance, but let's check Attendance model)
            // In this system, Attendance.userId is likely the studentId. 
            // Let's check Teacher attendance if it's being tracked. 
            // For now, let's just get Attendance marked by this teacher.
            const attendanceMarked = await Attendance.countDocuments({ markedBy: teacher._id });

            return {
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                classes: classes.map(c => c.className),
                homeworkCount: homework,
                announcementsCount: announcements,
                attendanceMarkedCount: attendanceMarked
            };
        }));

        // Aggregate Student Data
        const studentData = await Promise.all(students.map(async (student) => {
            const [attendance, results] = await Promise.all([
                Attendance.find({ userId: student._id }),
                Result.find({ studentId: student._id })
            ]);

            const totalAttendance = attendance.length;
            const presentCount = attendance.filter(a => a.status === 'Present').length;
            const attendancePercentage = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0;

            return {
                _id: student._id,
                name: student.name,
                email: student.email, // Username
                attendancePercentage,
                totalAttendance,
                presentCount,
                results: results.map(r => ({
                    subject: r.subject,
                    examName: r.examName,
                    marksObtained: r.marksObtained,
                    totalMarks: r.totalMarks,
                    grade: r.grade
                }))
            };
        }));

        res.json({
            teachers: teacherData,
            students: studentData
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSchool,
    getSchools,
    updateSchool,
    deleteSchool,
    approveSchool,
    rejectSchool,
    updateSchoolSettings,
    getMySchool,
    getAggregatedSchoolData
};
