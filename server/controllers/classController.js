const Class = require('../models/Class');
const Section = require('../models/Section');

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private/Admin
const createClass = async (req, res) => {
    const { className } = req.body;
    const schoolId = req.user.schoolId;

    try {
        const classDoc = await Class.create({ className, schoolId });
        res.status(201).json(classDoc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new section
// @route   POST /api/classes/sections
// @access  Private/Admin
const createSection = async (req, res) => {
    const { sectionName, classId, teacherId } = req.body;
    const schoolId = req.user.schoolId;

    try {
        const section = await Section.create({ sectionName, classId, schoolId, teacherId });
        res.status(201).json(section);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all classes for a school
// @route   GET /api/classes
// @access  Private/Admin, Teacher
const getClasses = async (req, res) => {
    const schoolId = req.user.schoolId;
    try {
        const classes = await Class.find({ schoolId });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all sections for a class
// @route   GET /api/classes/:classId/sections
// @access  Private/Admin, Teacher
const getSections = async (req, res) => {
    const { classId } = req.params;
    try {
        const sections = await Section.find({ classId }).populate('teacherId', 'name');
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createClass, createSection, getClasses, getSections };
