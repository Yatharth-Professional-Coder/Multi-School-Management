import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaUserCheck, FaUserTimes, FaCalendarAlt, FaBook, FaClipboardList, FaBullhorn, FaUserPlus } from 'react-icons/fa';

const TeacherDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('Attendance'); // Attendance, My Students, Homework, Results
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [newStudentData, setNewStudentData] = useState({ name: '', email: '', password: '', role: 'Student' });
    const [teacherClass, setTeacherClass] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(1);
    const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);
    const [existingRecords, setExistingRecords] = useState([]);


    // Homework State
    const [homeworkList, setHomeworkList] = useState([]);
    const [homeworkData, setHomeworkData] = useState({ title: '', description: '', subject: '', deadline: '' });

    // Results State
    const [resultData, setResultData] = useState({ studentId: '', examName: '', subject: '', marksObtained: '', totalMarks: '', grade: '' });

    // Announcements State
    const [announcements, setAnnouncements] = useState([]);
    const [announcementData, setAnnouncementData] = useState({ title: '', content: '', targetAudience: 'All' });
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

    const config = {
        headers: { Authorization: `Bearer ${user.token}` },
    };

    // Initial data fetch on mount
    useEffect(() => {
        fetchTeacherClass();
        fetchTimetable();
    }, []);

    // Tab-specific fetching
    useEffect(() => {
        if (activeTab === 'My Students' && teacherClass) {
            fetchStudents(teacherClass._id);
        } else if (activeTab === 'Homework') {
            fetchHomework();
        } else if (activeTab === 'Announcements') {
            fetchAnnouncements();
        }
    }, [activeTab, teacherClass]);

    const fetchTeacherClass = async () => {
        try {
            const { data } = await api.get('/api/classes', config);
            const myClass = data.find(c => c.teacherId?._id === user._id);
            setTeacherClass(myClass);
        } catch (error) {
            console.error("Error fetching teacher class", error);
        }
    };

    const fetchStudents = async (classId) => {
        try {
            let url = `/api/users?role=Student`;
            if (classId) url += `&classId=${classId}`;

            const { data: studentsData } = await api.get(url, config);
            setStudents(studentsData);

            // Check for existing attendance
            const { data: attData } = await api.get(`/api/attendance/class/${classId}?date=${selectedDate}&period=${selectedPeriod}`, config);

            if (attData.length > 0) {
                setIsAlreadyMarked(true);
                setExistingRecords(attData);
                const markedAttendance = {};
                attData.forEach(record => {
                    markedAttendance[record.userId._id] = record.status;
                });
                setAttendance(markedAttendance);
            } else {
                setIsAlreadyMarked(false);
                setExistingRecords([]);
                const initialAttendance = {};
                studentsData.forEach(student => { initialAttendance[student._id] = 'Present'; });
                setAttendance(initialAttendance);
            }
        } catch (error) {
            console.error("Error fetching students/attendance", error);
            const msg = error.response?.data?.message || 'Error fetching students/attendance';
            alert(msg);
        }
    };


    const fetchHomework = async () => {
        try {
            const { data } = await api.get('/api/homework', config);
            setHomeworkList(data);
        } catch (error) { console.error("Error fetching homework", error); }
    };

    const fetchAnnouncements = async () => {
        try {
            const { data } = await api.get('/api/announcements', config);
            setAnnouncements(data);
        } catch (error) { console.error("Error fetching announcements", error); }
    };

    const fetchTimetable = async () => {
        try {
            const { data } = await api.get(`/api/timetable/teacher/${user._id}`, config);
            // Sort by period
            const sorted = data.sort((a, b) => a.period - b.period);
            setTimetable(sorted);

            // Auto-select current day's first period if available
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const today = days[new Date().getDay()];
            const todaysPeriods = sorted.filter(p => p.day === today);
            if (todaysPeriods.length > 0) {
                const firstPeriod = todaysPeriods[0];
                setSelectedPeriod(firstPeriod.period);
                if (!firstPeriod.isBreak && firstPeriod.classId) {
                    fetchStudents(firstPeriod.classId._id);
                }
            }
        } catch (error) {
            console.error("Error fetching timetable", error);
        }
    };

    // Effect to fetch students whenever period or day changes
    useEffect(() => {
        if (activeTab === 'Attendance' && timetable.length > 0) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOfWeek = days[new Date(selectedDate).getDay()];
            const periodEntry = timetable.find(p => p.day === dayOfWeek && p.period === selectedPeriod);

            if (periodEntry && !periodEntry.isBreak && periodEntry.classId) {
                // Only re-fetch if we don't have students yet or the class changed
                // This prevents resetting the local 'attendance' state while marking
                fetchStudents(periodEntry.classId._id);
            } else {
                setStudents([]); // Clear list if it's a break or no class scheduled
            }
        }
    }, [selectedPeriod, selectedDate, timetable.length, activeTab]); // Using length to avoid unnecessary triggers

    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const submitAttendance = async () => {
        const presentIds = Object.keys(attendance).filter(id => attendance[id] === 'Present');
        const absentIds = Object.keys(attendance).filter(id => attendance[id] === 'Absent');
        const lateIds = Object.keys(attendance).filter(id => attendance[id] === 'Late');

        try {
            const attendancePayload = { date: selectedDate, period: selectedPeriod };
            if (presentIds.length > 0) await api.post('/api/attendance', { ...attendancePayload, userIds: presentIds, status: 'Present' }, config);
            if (absentIds.length > 0) await api.post('/api/attendance', { ...attendancePayload, userIds: absentIds, status: 'Absent' }, config);
            if (lateIds.length > 0) await api.post('/api/attendance', { ...attendancePayload, userIds: lateIds, status: 'Late' }, config);
            alert(`Attendance for Period ${selectedPeriod} marked successfully!`);

            // Refresh to show summary view
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOfWeek = days[new Date(selectedDate).getDay()];
            const periodEntry = timetable.find(p => p.day === dayOfWeek && p.period === selectedPeriod);
            if (periodEntry && periodEntry.classId) {
                fetchStudents(periodEntry.classId._id);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to mark attendance';
            alert(msg);
        }
    };

    const handleRectifyRequest = async (studentId, newStatus) => {
        const reason = prompt(`Reason for changing attendance to ${newStatus}:`);
        if (!reason) return;

        try {
            await api.put('/api/attendance/rectify', {
                date: selectedDate,
                reason,
                studentId,
                period: selectedPeriod,
                newStatus
            }, config);
            alert('Rectification request sent to Principal');

            // Refresh records
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOfWeek = days[new Date(selectedDate).getDay()];
            const periodEntry = timetable.find(p => p.day === dayOfWeek && p.period === selectedPeriod);
            if (periodEntry && periodEntry.classId) {
                fetchStudents(periodEntry.classId._id);
            }
        } catch (error) {
            alert('Failed to send rectification request');
        }
    };


    const submitHomework = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/homework', homeworkData, config);
            alert('Homework assigned!');
            setHomeworkData({ title: '', description: '', subject: '', deadline: '' });
            fetchHomework();
        } catch (error) { alert('Failed to assign homework'); }
    };

    const submitResult = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/results', resultData, config);
            alert('Result uploaded!');
            setResultData({ ...resultData, marksObtained: '' }); // Clear marks to allow rapid entry for same subject/exam
        } catch (error) { alert('Failed to upload result'); }
    };

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/announcements', announcementData, config);
            alert('Announcement posted!');
            setAnnouncementData({ title: '', content: '', targetAudience: 'All' });
            setShowAnnouncementForm(false);
            fetchAnnouncements();
        } catch (error) { alert('Failed to post announcement'); }
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        if (!teacherClass) {
            alert('You are not assigned to any class yet');
            return;
        }
        try {
            const studentPayload = {
                ...newStudentData,
                classId: teacherClass._id,
                schoolId: user.schoolId
            };
            await api.post('/api/users', studentPayload, config);
            setShowAddForm(false);
            setNewStudentData({ name: '', email: '', password: '', role: 'Student' });
            fetchStudents();
            alert('Student added successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding student');
        }
    };

    const handleStudentUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatePayload = {
                name: editingStudent.name,
                email: editingStudent.email
            };
            if (editingStudent.password) {
                updatePayload.password = editingStudent.password;
            }
            await api.put(`/api/users/${editingStudent._id}`, updatePayload, config);
            setEditingStudent(null);
            fetchStudents();
            alert('Student updated successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating student');
        }
    };

    return (
        <div className="container fade-in" style={{ paddingTop: '20px' }}>

            <div className="flex-mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <div>
                    <h1>Teacher Dashboard</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Welcome, {user.name}</p>
                </div>
                <button onClick={logout} className="btn btn-danger" style={{ alignSelf: 'flex-start' }}>Logout</button>
            </div>


            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '10px' }}>

                {['Attendance', 'My Students', 'Homework', 'Results', 'Announcements', 'Full Timetable'].filter(tab => {
                    if (tab === 'My Students') return !!teacherClass;
                    if (tab === 'Homework') return user.schoolSettings?.features?.enableHomework !== false;
                    if (tab === 'Results') return user.schoolSettings?.features?.enableResults !== false;
                    if (tab === 'Announcements') return true;
                    if (tab === 'Full Timetable') return user.schoolSettings?.features?.enableTimetable !== false;
                    if (tab === 'Attendance') return user.schoolSettings?.features?.enableAttendance !== false;
                    return true;
                }).map(tab => (
                    <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                ))}
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>

                {activeTab === 'Attendance' && (
                    <>
                        <div className="flex-mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <h2>Mark Attendance</h2>
                            </div>
                            <div className="flex-mobile-col w-full-mobile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field w-full-mobile" style={{ width: 'auto' }} />
                                <div className="w-full-mobile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: 'hsl(var(--text-dim))', whiteSpace: 'nowrap' }}>Period:</span>
                                    <select
                                        className="input-field w-full-mobile"
                                        style={{ width: 'auto' }}
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                                            <option key={p} value={p}>Period {p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>


                        {/* Schedule Helper */}
                        {timetable.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ marginBottom: '10px', color: 'hsl(var(--accent))', fontWeight: 'bold' }}>
                                    {(() => {
                                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                        const dayOfWeek = days[new Date(selectedDate).getDay()];
                                        const current = timetable.find(p => p.day === dayOfWeek && p.period === selectedPeriod);
                                        return current ? (current.isBreak ? "Current: Break Time" : `Current Class: ${current.classId?.className || 'Unknown'}`) : "No class scheduled for this period";
                                    })()}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                                    {timetable
                                        .filter(p => p.day === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(selectedDate).getDay()])
                                        .map(p => (
                                            <div
                                                key={p._id}
                                                onClick={() => !p.isBreak && setSelectedPeriod(p.period)}
                                                style={{
                                                    minWidth: '150px',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    background: p.isBreak ? 'rgba(255, 100, 100, 0.1)' : selectedPeriod === p.period ? 'rgba(50, 200, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                                                    border: p.isBreak ? '1px solid rgba(255, 100, 100, 0.3)' : selectedPeriod === p.period ? '1px solid #32c8ff' : '1px solid transparent',
                                                    cursor: p.isBreak ? 'default' : 'pointer',
                                                    opacity: p.isBreak ? 0.7 : 1
                                                }}
                                            >
                                                <div style={{ fontWeight: 'bold', color: p.isBreak ? '#ff6464' : selectedPeriod === p.period ? '#32c8ff' : 'inherit' }}>
                                                    P{p.period}: {p.subject} {p.isBreak && '(Break)'}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>{p.isBreak ? 'Break' : p.classId?.className}</div>
                                                <div style={{ fontSize: '0.7rem' }}>{p.startTime} - {p.endTime}</div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        <div style={{ overflowX: 'auto' }}>
                            {isAlreadyMarked ? (
                                <div style={{ padding: '20px', background: 'rgba(100, 255, 150, 0.05)', borderRadius: '12px', border: '1px solid rgba(100, 255, 150, 0.2)' }}>
                                    <h3 style={{ color: '#64ff96', marginBottom: '15px' }}>Already Marked</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ textAlign: 'left', padding: '10px' }}>Student Name</th>
                                                <th style={{ textAlign: 'center', padding: '10px' }}>Status</th>
                                                <th style={{ textAlign: 'right', padding: '10px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {existingRecords.map(record => (
                                                <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '10px' }}>{record.userId.name}</td>
                                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                                        <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.3)', borderRadius: '30px', padding: '4px' }}>
                                                            <button
                                                                onClick={() => record.status !== 'Present' && handleRectifyRequest(record.userId._id, 'Present')}
                                                                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px', background: record.status === 'Present' ? 'hsl(140, 70%, 40%)' : 'transparent', color: '#fff', fontWeight: 'bold', border: 'none', cursor: record.status === 'Present' ? 'default' : 'pointer' }}
                                                            >
                                                                P
                                                            </button>
                                                            <button
                                                                onClick={() => record.status !== 'Absent' && handleRectifyRequest(record.userId._id, 'Absent')}
                                                                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px', background: record.status === 'Absent' ? 'hsl(0, 70%, 50%)' : 'transparent', color: '#fff', fontWeight: 'bold', border: 'none', cursor: record.status === 'Absent' ? 'default' : 'pointer' }}
                                                            >
                                                                A
                                                            </button>
                                                            <button
                                                                onClick={() => record.status !== 'Late' && handleRectifyRequest(record.userId._id, 'Late')}
                                                                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px', background: record.status === 'Late' ? 'hsl(40, 90%, 50%)' : 'transparent', color: '#fff', fontWeight: 'bold', border: 'none', cursor: record.status === 'Late' ? 'default' : 'pointer' }}
                                                            >
                                                                L
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '10px', textAlign: 'right' }}>
                                                        {record.rectificationRequest?.requested && (
                                                            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--accent))' }}>
                                                                Pending {record.rectificationRequest.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ textAlign: 'left', padding: '15px' }}>Student Name</th>
                                            <th style={{ textAlign: 'center', padding: '15px' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(student => (
                                            <tr key={student._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '15px' }}>{student.name}</td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.3)', borderRadius: '30px', padding: '4px' }}>
                                                        <button onClick={() => handleAttendanceChange(student._id, 'Present')} style={{ padding: '8px 16px', borderRadius: '20px', background: attendance[student._id] === 'Present' ? 'hsl(140, 70%, 40%)' : 'transparent', color: '#fff', fontWeight: 'bold' }}>P</button>
                                                        <button onClick={() => handleAttendanceChange(student._id, 'Absent')} style={{ padding: '8px 16px', borderRadius: '20px', background: attendance[student._id] === 'Absent' ? 'hsl(0, 70%, 50%)' : 'transparent', color: '#fff', fontWeight: 'bold' }}>A</button>
                                                        <button onClick={() => handleAttendanceChange(student._id, 'Late')} style={{ padding: '8px 16px', borderRadius: '20px', background: attendance[student._id] === 'Late' ? 'hsl(40, 90%, 50%)' : 'transparent', color: '#fff', fontWeight: 'bold' }}>L</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {students.length === 0 && (
                                            <tr>
                                                <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>
                                                    No students found for this class.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div style={{ marginTop: '30px', textAlign: 'right' }}>
                            {timetable.find(p => p.period === selectedPeriod && p.day === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(selectedDate).getDay()])?.isBreak ? (
                                <p style={{ color: '#ff6464', fontWeight: 'bold' }}>Attendance cannot be marked for break periods.</p>
                            ) : isAlreadyMarked ? (
                                <p style={{ color: 'hsl(var(--text-dim))' }}>Attendance has already been submitted for this period.</p>
                            ) : (
                                <button className="btn btn-primary" onClick={submitAttendance}>Save Attendance</button>
                            )}
                        </div>

                    </>
                )}

                {activeTab === 'My Students' && (
                    <>
                        <div className="flex-mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '15px' }}>
                            <div>
                                <h2>Maintain Roster: {teacherClass?.className}</h2>
                                <p style={{ color: 'hsl(var(--text-dim))', fontSize: '0.9rem' }}>You are the incharge of this class.</p>
                            </div>
                            <button className="btn btn-secondary w-full-mobile" onClick={() => setShowAddForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaUserPlus /> Add Student
                            </button>
                        </div>


                        {showAddForm && (
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                <h3 style={{ marginBottom: '15px' }}>Add New Student</h3>
                                <form onSubmit={handleStudentSubmit}>
                                    <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

                                        <input
                                            placeholder="Full Name"
                                            className="input-field"
                                            value={newStudentData.name}
                                            onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                                            required
                                        />
                                        <input
                                            placeholder="Email / Username"
                                            className="input-field"
                                            value={newStudentData.email}
                                            onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="Temporary Password"
                                            className="input-field"
                                            value={newStudentData.password}
                                            onChange={(e) => setNewStudentData({ ...newStudentData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Create Student</button>
                                    <button type="button" onClick={() => setShowAddForm(false)} style={{ marginLeft: '10px', color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                </form>
                            </div>
                        )}

                        {editingStudent && (
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                <h3 style={{ marginBottom: '15px' }}>Edit Student: {editingStudent.name}</h3>
                                <form onSubmit={handleStudentUpdate}>
                                    <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

                                        <input
                                            placeholder="Full Name"
                                            className="input-field"
                                            value={editingStudent.name}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                            required
                                        />
                                        <input
                                            placeholder="Email / Username"
                                            className="input-field"
                                            value={editingStudent.email}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="New Password (Leave blank to keep current)"
                                            className="input-field"
                                            value={editingStudent.password || ''}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Update Student</button>
                                    <button type="button" onClick={() => setEditingStudent(null)} style={{ marginLeft: '10px', color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                </form>
                            </div>
                        )}

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Student Name</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Username/Email</th>
                                        <th style={{ textAlign: 'right', padding: '15px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '15px' }}>{student.name}</td>
                                            <td style={{ padding: '15px' }}>{student.email}</td>
                                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => setEditingStudent(student)}
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                                >
                                                    Edit Credentials
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>
                                                No students found in your class.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'Homework' && (
                    <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                        <div>
                            <h3>Assign Homework</h3>
                            <form onSubmit={submitHomework} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                                <input placeholder="Title" className="input-field" value={homeworkData.title} onChange={e => setHomeworkData({ ...homeworkData, title: e.target.value })} required />
                                <textarea placeholder="Description" className="input-field" style={{ minHeight: '100px' }} value={homeworkData.description} onChange={e => setHomeworkData({ ...homeworkData, description: e.target.value })} required />
                                <input placeholder="Subject" className="input-field" value={homeworkData.subject} onChange={e => setHomeworkData({ ...homeworkData, subject: e.target.value })} required />
                                <input type="date" className="input-field" value={homeworkData.deadline} onChange={e => setHomeworkData({ ...homeworkData, deadline: e.target.value })} required />
                                <button type="submit" className="btn btn-primary">Assign</button>
                            </form>
                        </div>
                        <div>
                            <h3>Recent Assignments</h3>
                            <div style={{ marginTop: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                                {homeworkList.map(hw => (
                                    <div key={hw._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                                        <h4>{hw.title}</h4>
                                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>{hw.description}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.8rem', color: 'hsl(var(--accent))' }}>
                                            <span>{hw.subject}</span>
                                            <span>From: {new Date(hw.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Results' && (
                    <div>
                        <h3>Upload Results</h3>
                        <form onSubmit={submitResult} className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>

                            <select className="input-field" value={resultData.studentId} onChange={e => setResultData({ ...resultData, studentId: e.target.value })} required>
                                <option value="">Select Student</option>
                                {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                            <input placeholder="Exam Name" className="input-field" value={resultData.examName} onChange={e => setResultData({ ...resultData, examName: e.target.value })} required />
                            <input placeholder="Subject" className="input-field" value={resultData.subject} onChange={e => setResultData({ ...resultData, subject: e.target.value })} required />
                            <input type="number" placeholder="Marks Obtained" className="input-field" value={resultData.marksObtained} onChange={e => setResultData({ ...resultData, marksObtained: e.target.value })} required />
                            <input type="number" placeholder="Total Marks" className="input-field" value={resultData.totalMarks} onChange={e => setResultData({ ...resultData, totalMarks: e.target.value })} required />
                            <input placeholder="Grade (Optional)" className="input-field" value={resultData.grade} onChange={e => setResultData({ ...resultData, grade: e.target.value })} />

                            <div style={{ gridColumn: 'span 2' }}>
                                <button type="submit" className="btn btn-primary">Upload Result</button>
                            </div>
                        </form>
                    </div>
                )}
                {activeTab === 'Announcements' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: 'hsl(var(--white))' }}>Announcements</h2>
                            <button className="btn btn-primary" onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}>
                                {showAnnouncementForm ? 'Cancel' : 'Post Announcement'}
                            </button>
                        </div>

                        {showAnnouncementForm && (
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                <h3 style={{ marginBottom: '15px' }}>New Announcement</h3>
                                <form onSubmit={handleAnnouncementSubmit}>
                                    <input placeholder="Title" className="input-field" value={announcementData.title} onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })} required style={{ marginBottom: '10px' }} />
                                    <textarea placeholder="Content" className="input-field" value={announcementData.content} onChange={(e) => setAnnouncementData({ ...announcementData, content: e.target.value })} required style={{ marginBottom: '10px', minHeight: '100px' }} />
                                    <select className="input-field" value={announcementData.targetAudience} onChange={(e) => setAnnouncementData({ ...announcementData, targetAudience: e.target.value })} style={{ marginBottom: '10px' }}>
                                        <option value="All">All</option>
                                        <option value="Teachers">Teachers</option>
                                        <option value="Students">Students</option>
                                        <option value="Parents">Parents</option>
                                    </select>
                                    <button type="submit" className="btn btn-primary">Post Announcement</button>
                                </form>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                            {announcements.map(ann => (
                                <div key={ann._id} className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3>{ann.title}</h3>
                                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--accent))', background: 'rgba(var(--accent-rgb), 0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                                            To: {ann.targetAudience}
                                        </span>
                                    </div>
                                    <p style={{ marginTop: '10px', color: 'hsl(var(--text-dim))', lineHeight: '1.6' }}>{ann.content}</p>
                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>
                                        <span>Posted by: {ann.postedBy?.name || 'Unknown'}</span>
                                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {announcements.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-dim))' }}>
                                    No announcements found.
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {activeTab === 'Full Timetable' && (
                    <div>
                        <h2 style={{ marginBottom: '20px' }}>Weekly Schedule</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Day</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Time</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Class / Section</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Subject</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Period</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                        const dayEntries = timetable.filter(e => e.day === day).sort((a, b) => a.period - b.period);
                                        if (dayEntries.length === 0) return null;

                                        return dayEntries.map((entry, index) => (
                                            <tr key={entry._id} style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                background: entry.isBreak ? 'rgba(255, 100, 100, 0.05)' : 'transparent'
                                            }}>
                                                {index === 0 && (
                                                    <td rowSpan={dayEntries.length} style={{ padding: '15px', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.1)', verticalAlign: 'top' }}>
                                                        {day}
                                                    </td>
                                                )}
                                                <td style={{ padding: '15px' }}>{entry.startTime} - {entry.endTime}</td>
                                                <td style={{ padding: '15px' }}>{entry.isBreak ? 'N/A' : entry.classId?.className || 'N/A'}</td>
                                                <td style={{ padding: '15px' }}>
                                                    {entry.subject} {entry.isBreak && <span style={{ fontSize: '0.7rem', background: 'rgba(255, 100, 100, 0.2)', color: '#ff6464', padding: '2px 6px', borderRadius: '10px', marginLeft: '5px' }}>Break</span>}
                                                </td>
                                                <td style={{ padding: '15px' }}>P{entry.period}</td>
                                            </tr>
                                        ));
                                    })}
                                    {timetable.length === 0 && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No schedule entries found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
