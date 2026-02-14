const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    subscriptionPlan: {
        type: String,
        enum: ['Basic', 'Standard', 'Premium'],
        default: 'Basic',
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    settings: {
        themeColor: {
            type: String,
            default: '#32c8ff', // Default primary color
        },
        logoUrl: {
            type: String,
            default: '',
        },
        gradingSystem: {
            type: String,
            enum: ['Percentage', 'GPA'],
            default: 'Percentage',
        },
        features: {
            enableTimetable: { type: Boolean, default: true },
            enableAttendance: { type: Boolean, default: true },
            enableHomework: { type: Boolean, default: true },
            enableResults: { type: Boolean, default: true },
            enableAnnouncements: { type: Boolean, default: true },
            enableHalfDay: { type: Boolean, default: false },
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);
