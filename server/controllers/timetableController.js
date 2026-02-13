const Timetable = require('../models/Timetable');
const Class = require('../models/Class');

// @desc    Create a timetable entry
// @route   POST /api/timetable
// @access  Private/Admin
const createTimetableEntry = async (req, res) => {
    const { classId, teacherId, subject, day, period, startTime, endTime, isBreak } = req.body;
    const schoolId = req.user.schoolId;

    try {
        // 1. Validation: Basic checks
        if (!startTime || !endTime) {
            return res.status(400).json({ message: 'Start and End times are required' });
        }
        if (period < 1) {
            return res.status(400).json({ message: 'Period number must be a positive integer' });
        }
        if (startTime >= endTime) {
            return res.status(400).json({ message: 'Start time must be before End time' });
        }

        // Helper to check for overlaps
        const checkOverlap = async (queryType, id) => {
            const query = { day };
            if (queryType === 'class') query.classId = id;
            else query.teacherId = id;

            const existingEntries = await Timetable.find(query);
            for (const entry of existingEntries) {
                // Check if current [startTime, endTime] overlaps with entry [entry.startTime, entry.endTime]
                // Overlap condition: (StartA < EndB) and (EndA > StartB)
                if (startTime < entry.endTime && endTime > entry.startTime) {
                    return entry;
                }
            }
            return null;
        };

        // 2. Validation: Class Overlap
        const classOverlap = await checkOverlap('class', classId);
        if (classOverlap) {
            return res.status(400).json({
                message: `Class already has a scheduled period (${classOverlap.subject}) at this time (${classOverlap.startTime} - ${classOverlap.endTime})`
            });
        }

        // 3. Validation: Teacher Overlap
        if (!isBreak && teacherId) {
            const teacherOverlap = await checkOverlap('teacher', teacherId);
            if (teacherOverlap) {
                const conflictClass = await Class.findById(teacherOverlap.classId);
                return res.status(400).json({
                    message: `Teacher is already busy with ${conflictClass?.className} at this time (${teacherOverlap.startTime} - ${teacherOverlap.endTime})`
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
