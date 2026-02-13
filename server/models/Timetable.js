const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return !this.isBreak; } // Only required if not a break
    },
    subject: {
        type: String,
        required: true,
    },
    isBreak: {
        type: Boolean,
        default: false
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
    },
    period: {
        type: Number,
        required: true,
    },
    startTime: {
        type: String, // e.g., "08:00"
        required: true,
    },
    endTime: {
        type: String, // e.g., "09:00"
        required: true,
    },
}, { timestamps: true });

// Ensure a teacher isn't scheduled for two classes at once (simple check)
// timetableSchema.index({ teacherId: 1, day: 1, period: 1 }, { unique: true });
// Ensure a class doesn't have two subjects at once
timetableSchema.index({ classId: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
