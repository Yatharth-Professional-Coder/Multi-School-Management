const Timetable = require('../models/Timetable');
const Class = require('../models/Class');

// @desc    Create a timetable entry
// @route   POST /api/timetable
// @access  Private/Admin
// Helper to check for overlaps
const validateTimetableEntry = async (data, excludeId = null) => {
    const { classId, teacherId, day, startTime, endTime, isBreak } = data;

    if (!startTime || !endTime) throw new Error('Start and End times are required');
    if (startTime >= endTime) throw new Error('Start time must be before End time');

    // 1. Check Class Overlap
    const classOverlap = await Timetable.findOne({
        _id: { $ne: excludeId },
        day,
        classId,
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
    });

    if (classOverlap) {
        throw new Error(`Class already has a scheduled period (${classOverlap.subject}) at this time (${classOverlap.startTime} - ${classOverlap.endTime})`);
    }

    // 2. Check Teacher Overlap
    if (!isBreak && teacherId) {
        const teacherOverlap = await Timetable.findOne({
            _id: { $ne: excludeId },
            day,
            teacherId,
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $gt: startTime, $lte: endTime } },
                { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
            ]
        });

        if (teacherOverlap) {
            throw new Error('teacher is already assigned');
        }
    }
    return true;
};

const createTimetableEntry = async (req, res) => {
    const { classId, teacherId, subject, day, period, startTime, endTime, isBreak } = req.body;
    const schoolId = req.user.schoolId;

    try {
        if (period < 1) {
            return res.status(400).json({ message: 'Period number must be a positive integer' });
        }

        await validateTimetableEntry({ classId, teacherId, day, startTime, endTime, isBreak });

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
        if (!timetableEntry) {
            return res.status(404).json({ message: 'Timetable entry not found' });
        }

        const updateData = {
            classId: timetableEntry.classId,
            teacherId: req.body.teacherId !== undefined ? req.body.teacherId : timetableEntry.teacherId,
            subject: req.body.subject || timetableEntry.subject,
            day: req.body.day || timetableEntry.day,
            period: req.body.period || timetableEntry.period,
            startTime: req.body.startTime || timetableEntry.startTime,
            endTime: req.body.endTime || timetableEntry.endTime,
            isBreak: req.body.isBreak !== undefined ? req.body.isBreak : timetableEntry.isBreak
        };

        // Validate the updated data against others (excluding self)
        await validateTimetableEntry(updateData, timetableEntry._id);

        Object.assign(timetableEntry, updateData);
        const updatedEntry = await timetableEntry.save();
        res.json(updatedEntry);

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
