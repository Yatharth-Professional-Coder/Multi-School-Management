const Announcement = require('../models/Announcement');

// @desc    Create Announcement
// @route   POST /api/announcements
// @access  Private/Admin, Teacher
const createAnnouncement = async (req, res) => {
    const { title, content, targetAudience } = req.body;
    const schoolId = req.user.schoolId;
    const postedBy = req.user._id;

    try {
        const announcement = await Announcement.create({
            title,
            content,
            targetAudience: targetAudience || 'All',
            schoolId,
            postedBy
        });
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Announcements
// @route   GET /api/announcements
// @access  Private/All
const getAnnouncements = async (req, res) => {
    const schoolId = req.user.schoolId;
    const role = req.user.role;

    try {
        // Filter by target audience or "All"
        // Also admins should see "Teachers", "Students" targeted ones too probably
        let query = { schoolId };

        if (role === 'Student') {
            query.targetAudience = { $in: ['All', 'Students'] };
        } else if (role === 'Teacher') {
            query.targetAudience = { $in: ['All', 'Teachers'] };
        } else if (role === 'Parent') {
            query.targetAudience = { $in: ['All', 'Parents'] };
        }
        // Admin sees all by default with just schoolId filter

        const announcements = await Announcement.find(query).sort({ createdAt: -1 }).populate('postedBy', 'name');
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createAnnouncement, getAnnouncements };
