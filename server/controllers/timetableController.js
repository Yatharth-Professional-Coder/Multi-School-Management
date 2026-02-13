const Timetable = require('../models/Timetable');
const Class = require('../models/Class');

// @desc    Create a timetable entry
// @route   POST /api/timetable
// @access  Private/Admin
const createTimetableEntry = async (req, res) => {
    const { classId, teacherId, subject, day, period, startTime, endTime, isBreak } = req.body;
    const schoolId = req.user.schoolId;

    try {
        // 1. Validation: Ensure period is positive
        if (period < 1) {
            return res.status(400).json({ message: 'Period number must be a positive integer' });
        }

        // 2. Validation: Ensure class doesn't already have this period (covered by unique index, but good to handle explicitly)
        const classConflict = await Timetable.findOne({ classId, day, period });
        if (classConflict) {
            return res.status(400).json({ message: `Class already has a period (P${period}) scheduled for ${day}` });
        }

        // 3. Validation: Ensure teacher isn't double-booked
        if (!isBreak && teacherId) {
            const teacherConflict = await Timetable.findOne({ teacherId, day, period });
            if (teacherConflict) {
                const conflictClass = await Class.findById(teacherConflict.classId);
                return res.status(400).json({
                    message: `Teacher is already busy with ${conflictClass?.className} during P${period} on ${day}`
                });
            }
        }

        const timetableEntry = await Timetable.create({
            schoolId,
            classId,
            teacherId: isBreak ? null : teacherId,
            subject,
            day,
            period,
            startTime,
            endTime,
            isBreak: !!isBreak
        });
        res.status(201).json(timetableEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get timetable for a class
// @route   GET /api/timetable/class/:classId
// @access  Private/Admin, Teacher, Student, Parent
const getClassTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.find({ classId: req.params.classId })
            .populate('teacherId', 'name')
            .sort({ day: 1, period: 1 });
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get timetable for a teacher (Daily Schedule)
// @route   GET /api/timetable/teacher/:teacherId
// @access  Private/Admin, Teacher
const getTeacherTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.find({ teacherId: req.params.teacherId })
            .populate('classId', 'className')
            .sort({ day: 1, period: 1 });
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a timetable entry
// @route   PUT /api/timetable/:id
// @access  Private/Admin
const updateTimetableEntry = async (req, res) => {
    try {
        const timetableEntry = await Timetable.findById(req.params.id);
        if (timetableEntry) {
            timetableEntry.teacherId = req.body.teacherId || timetableEntry.teacherId;
            timetableEntry.subject = req.body.subject || timetableEntry.subject;
            timetableEntry.day = req.body.day || timetableEntry.day;
            timetableEntry.period = req.body.period || timetableEntry.period;
            timetableEntry.startTime = req.body.startTime || timetableEntry.startTime;
            timetableEntry.endTime = req.body.endTime || timetableEntry.endTime;

            const updatedEntry = await timetableEntry.save();
            res.json(updatedEntry);
        } else {
            res.status(404).json({ message: 'Timetable entry not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private/Admin
const deleteTimetableEntry = async (req, res) => {
    try {
        const timetableEntry = await Timetable.findById(req.params.id);
        if (timetableEntry) {
            await timetableEntry.deleteOne();
            res.json({ message: 'Timetable entry removed' });
        } else {
            res.status(404).json({ message: 'Timetable entry not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTimetableEntry,
    getClassTimetable,
    getTeacherTimetable,
    updateTimetableEntry,
    deleteTimetableEntry
};
