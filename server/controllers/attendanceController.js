const Attendance = require('../models/Attendance');

// @desc    Mark attendance for multiple users
// @route   POST /api/attendance
// @access  Private/Admin, Teacher
const markAttendance = async (req, res) => {
    const { userIds, date, status } = req.body; // userIds is array, status is "Present" or "Absent"
    // For simplicity, we assume bulk marking for now.
    const schoolId = req.user.schoolId;
    const markedBy = req.user._id;

    try {
        const attendanceRecords = userIds.map(userId => ({
            userId,
            date: new Date(date),
            status,
            schoolId,
            markedBy
        }));

        // Using bulkWrite for efficiency or insertMany
        // However, if we need to update existing (re-marking), bulkWrite with updateOne upsert is better
        const operations = attendanceRecords.map(record => ({
            updateOne: {
                filter: { userId: record.userId, date: record.date },
                update: { $set: record },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);

        res.status(200).json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for a user
// @route   GET /api/attendance/:userId
// @access  Private/Admin, Teacher, Student, Parent
const getAttendance = async (req, res) => {
    const { userId } = req.params;

    // Authorization Check
    if (req.user.role === 'Student' && req.user._id.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to view other students records' });
    }
    if (req.user.role === 'Parent' && (!req.user.childId || req.user.childId.toString() !== userId)) {
        return res.status(403).json({ message: 'Not authorized to view this student' });
    }

    try {
        const attendance = await Attendance.find({ userId }).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request rectification
// @route   PUT /api/attendance/rectify
// @access  Private/Student, Teacher
const requestRectification = async (req, res) => {
    const { date, reason } = req.body;
    const userId = req.user._id;

    try {
        const record = await Attendance.findOne({ userId, date: new Date(date) });

        if (!record) {
            return res.status(404).json({ message: 'Attendance record not found for this date' });
        }

        record.rectificationRequest = {
            requested: true,
            reason,
            status: 'Pending'
        };

        await record.save();
        res.json({ message: 'Rectification requested' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject Rectification
// @route   PUT /api/attendance/rectify/approve
// @access  Private/Admin
const approveRectification = async (req, res) => {
    const { attendanceId, status } = req.body; // status: 'Approved' or 'Rejected'

    try {
        const record = await Attendance.findById(attendanceId);

        if (!record) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        record.rectificationRequest.status = status;
        if (status === 'Approved') {
            // Flip the status if approved (Present <-> Absent)
            record.status = record.status === 'Absent' ? 'Present' : 'Absent';
        }

        await record.save();
        res.json({ message: `Rectification request ${status}` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Pending Rectifications
// @route   GET /api/attendance/rectify/pending
// @access  Private/Admin
const getPendingRectifications = async (req, res) => {
    const schoolId = req.user.schoolId;
    try {
        const pending = await Attendance.find({
            "rectificationRequest.status": 'Pending',
            schoolId
        }).populate('userId', 'name email').sort({ date: -1 });
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { markAttendance, getAttendance, requestRectification, approveRectification, getPendingRectifications };
