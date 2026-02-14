const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Half Day'],
        required: true,
    },
    period: {
        type: Number,
        default: 1, // Default to period 1 for backward compatibility
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rectificationRequest: {
        requested: { type: Boolean, default: false },
        reason: { type: String },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        newStatus: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day'] },
    },
}, { timestamps: true });

// Ensure one attendance record per user per day per period
attendanceSchema.index({ date: 1, userId: 1, period: 1 }, { unique: true, name: 'date_user_period_unique' });

module.exports = mongoose.model('Attendance', attendanceSchema);
