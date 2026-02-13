const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const School = require('./models/School');

const approveExistingSchools = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const result = await School.updateMany(
            { isApproved: { $exists: false } },
            { $set: { isApproved: true } }
        );

        console.log(`${result.modifiedCount} schools updated to approved status.`);

        // Also update any that were explicitly set to false if they existed before this migration
        const result2 = await School.updateMany(
            { isApproved: false },
            { $set: { isApproved: true } }
        );
        console.log(`${result2.modifiedCount} schools previously set to false were updated to approved.`);

        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
};

approveExistingSchools();
