const Homework = require('../models/Homework');

// @desc    Add Homework
// @route   POST /api/homework
// @access  Private/Teacher, Admin
const addHomework = async (req, res) => {
    const { title, description, classId, subject, deadline } = req.body;
    const schoolId = req.user.schoolId;
    const teacherId = req.user._id;

    try {
        const homework = await Homework.create({
            title,
            description,
            schoolId,
            classId: classId || null, // Optional if generic
            subject,
            deadline,
            teacherId
        });
        res.status(201).json(homework);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Homework
// @route   GET /api/homework
// @access  Private/All
const getHomework = async (req, res) => {
    const schoolId = req.user.schoolId;
    // Filters could be added (classId, subject)

    try {
        const homework = await Homework.find({ schoolId }).sort({ deadline: 1 });
        res.json(homework);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addHomework, getHomework };
