const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    examName: {
        type: String,
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    marksObtained: {
        type: Number,
        required: true,
    },
    totalMarks: {
        type: Number,
        required: true,
    },
    grade: {
        type: String,
    },
    feedback: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
