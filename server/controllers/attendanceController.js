const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark attendance for multiple users
// @route   POST /api/attendance
// @access  Private/Admin, Teacher
const markAttendance = async (req, res) => {
    const { userIds, date, status, period } = req.body; // userIds is array, status is "Present" or "Absent", period is Number
    const schoolId = req.user.schoolId;
    const markedBy = req.user._id;

    try {
        const attendanceRecords = userIds.map(userId => ({
            userId,
            date: new Date(date),
            status,
            period: period || 1,
            schoolId,
            markedBy
        }));

        const operations = attendanceRecords.map(record => ({
            updateOne: {
                filter: { userId: record.userId, date: record.date, period: record.period },
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
    const { date, reason, studentId, period, newStatus } = req.body;

    // If teacher is requesting, they must provide studentId
    // If student is requesting, they use their own ID
    const userId = req.user.role === 'Student' ? req.user._id : studentId;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required for rectification' });
    }

    try {
        const query = {
            userId,
            date: new Date(date)
        };

        if (period) {
            query.period = Number(period);
        }

        const record = await Attendance.findOne(query);

        if (!record) {
            return res.status(404).json({ message: 'Attendance record not found for this date/period' });
        }

        record.rectificationRequest = {
            requested: true,
            reason: reason || 'Teacher requested rectification',
            status: 'Pending',
            newStatus
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
        if (status === 'Approved' && record.rectificationRequest.newStatus) {
            record.status = record.rectificationRequest.newStatus;
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

// @desc    Get attendance for a specific class
// @route   GET /api/attendance/class/:classId
// @access  Private/Admin, Teacher
const getClassAttendance = async (req, res) => {
    const { classId } = req.params;
    const { date, period } = req.query; // Optional date and period filter

    try {
        const students = await User.find({ role: 'Student', studentClass: classId }).select('_id name');
        const studentIds = students.map(s => s._id);

        let query = { userId: { $in: studentIds } };
        if (date) {
            const startDate = new Date(date);
            startDate.setUTCHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setUTCHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }
        if (period) {
            query.period = Number(period);
        }

        const attendance = await Attendance.find(query)
            .populate('userId', 'name')
            .sort({ date: -1, period: 1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all attendance for school
// @route   GET /api/attendance
// @access  Private/Admin
const getSchoolAttendance = async (req, res) => {
    const schoolId = req.user.schoolId;
    const { date, role } = req.query;

    try {
        let query = { schoolId };

        if (date) {
            const startDate = new Date(date);
            startDate.setUTCHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setUTCHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        if (role) {
            const users = await User.find({ schoolId, role }).select('_id');
            const userIds = users.map(u => u._id);
            query.userId = { $in: userIds };
        }

        const attendance = await Attendance.find(query)
            .populate('userId', 'name role email')
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { markAttendance, getAttendance, requestRectification, approveRectification, getPendingRectifications, getClassAttendance, getSchoolAttendance };
