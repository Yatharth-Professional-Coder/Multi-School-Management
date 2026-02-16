const Result = require('../models/Result');

// @desc    Add or Update Result
// @route   POST /api/results
// @access  Private/Admin, Teacher
const addResult = async (req, res) => {
    const { studentId, examName, subject, marksObtained, totalMarks, grade, feedback } = req.body;
    const schoolId = req.user.schoolId;

    try {
        const result = await Result.findOneAndUpdate(
            { studentId, examName, subject }, // Find existing result first? Maybe multiple entries allowed?
            // Assuming one entry per subject per exam for simplicity using upsert
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

    try {
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

module.exports = { addResult, getResults };
