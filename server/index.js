require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        // Drop legacy attendance index that doesn't include period
        try {
            // Try to drop the index directly on the collection
            await mongoose.connection.db.collection('attendances').dropIndex('date_1_userId_1');
            console.log('Successfully dropped legacy attendance index: date_1_userId_1');
        } catch (err) {
            // Code 27 or IndexNotFound means it's already gone
            if (err.code === 27 || err.codeName === 'IndexNotFound') {
                console.log('Legacy index date_1_userId_1 already removed.');
            } else if (err.code === 26 || err.codeName === 'NamespaceNotFound') {
                console.log('Collection not found during index cleanup (will be created on first use).');
            } else {
                console.log('Note on index cleanup:', err.message);
            }
        }
    })
    .catch(err => console.log(err));

const authRoutes = require('./routes/authRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const resultRoutes = require('./routes/resultRoutes');
const homeworkRoutes = require('./routes/homeworkRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const timetableRoutes = require('./routes/timetableRoutes'); // Added timetableRoutes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/timetable', timetableRoutes);

app.get('/', (req, res) => {
    res.send('School Management System API is running');
});


if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
