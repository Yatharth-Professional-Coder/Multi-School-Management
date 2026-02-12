const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    classId: { // Optional specific class target
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
    },
    subject: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Homework', homeworkSchema);
