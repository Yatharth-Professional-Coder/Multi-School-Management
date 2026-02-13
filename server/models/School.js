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
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);
