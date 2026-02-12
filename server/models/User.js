const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['SuperAdmin', 'Admin', 'SubAdmin', 'Teacher', 'Student', 'Parent'],
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
    },
    profilePixel: {
        type: String,
        default: '',
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the Student User
        default: null
    },
    studentClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        default: null
    }
}, { timestamps: true });

// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
