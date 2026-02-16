const Result = require('../models/Result');
const User = require('../models/User');
const Class = require('../models/Class');

// @desc    Add or Update Result
// @route   POST /api/results
// @access  Private/Admin, Teacher
const addResult = async (req, res) => {
    const { studentId, examName, subject, marksObtained, totalMarks, grade, feedback } = req.body;
    const schoolId = req.user.schoolId;
    const { role, _id: teacherId } = req.user;

    try {
        // Restriction check for Teachers
        if (role === 'Teacher') {
            const student = await User.findById(studentId).select('studentClass');
            if (!student || !student.studentClass) {
                return res.status(400).json({ message: 'Student not found or not assigned to a class' });
            }

            const assignedClass = await Class.findById(student.studentClass);
            if (!assignedClass || assignedClass.teacherId?.toString() !== teacherId.toString()) {
                return res.status(403).json({ message: 'Authorization failed: You can only upload results for your own class students' });
            }
        }

        const result = await Result.findOneAndUpdate(
            { studentId, examName, subject },
            {
                studentId,
                examName,
                subject,
                marksObtained,
                totalMarks,
                grade,
                feedback,
                schoolId
            },
            { new: true, upsert: true }
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add or Update Result
// @route   POST /api/results
// @access  Private/Admin, Teacher
const addBulkResults = async (req, res) => {
    const { results } = req.body; // Array of results
    const schoolId = req.user.schoolId;
    const { role, _id: teacherId } = req.user;

    try {
        // Restriction check for Teachers
        if (role === 'Teacher') {
            const studentIds = [...new Set(results.map(r => r.studentId))];
            const students = await User.find({ _id: { $in: studentIds } }).select('studentClass');

            // Get unique classes for these students
            const classIds = [...new Set(students.map(s => s.studentClass?.toString()).filter(id => id))];

            if (classIds.length === 0) {
                return res.status(400).json({ message: 'Selected students are not assigned to any class' });
            }

            const classes = await Class.find({ _id: { $in: classIds } });

            // Check if teacher is incharge of ALL involved classes
            const unauthorized = classes.some(c => c.teacherId?.toString() !== teacherId.toString());

            if (unauthorized) {
                return res.status(403).json({ message: 'Authorization failed: You can only upload results for your own class students' });
            }
        }

        const operations = results.map(result => ({
            updateOne: {
                filter: {
                    studentId: result.studentId,
                    examName: result.examName,
                    subject: result.subject
                },
                update: { ...result, schoolId },
                upsert: true
            }
        }));

        const bulkWriteResult = await Result.bulkWrite(operations);
        res.status(201).json(bulkWriteResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Results for a student (or all if teacher/admin looking for specific student)
// @route   GET /api/results
// @access  Private/Admin, Teacher, Student, Parent
const getResults = async (req, res) => {
    const { studentId } = req.query; // If Teacher/Admin querying
    const schoolId = req.user.schoolId;
    const role = req.user.role;
    const userId = req.user._id;

    try {
        let query = { schoolId };

        if (role === 'Student') {
            query.studentId = userId;
        } else if (role === 'Parent') {
            query.studentId = req.user.childId;
        } else if (studentId) {
            // Teacher/Admin filtering by student
            query.studentId = studentId;
        }

        const results = await Result.find(query).sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addResult, getResults, addBulkResults };
