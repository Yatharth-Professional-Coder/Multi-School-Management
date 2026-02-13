import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaUserCheck, FaUserTimes, FaCalendarAlt, FaBook, FaClipboardList, FaBullhorn, FaUserPlus } from 'react-icons/fa';

const TeacherDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('Attendance'); // Attendance, Homework, Results
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [newStudentData, setNewStudentData] = useState({ name: '', email: '', password: '', role: 'Student' });
    const [teacherClass, setTeacherClass] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(1);

    // Homework State
    const [homeworkList, setHomeworkList] = useState([]);
    const [homeworkData, setHomeworkData] = useState({ title: '', description: '', subject: '', deadline: '' });

    // Results State
    const [resultData, setResultData] = useState({ studentId: '', examName: '', subject: '', marksObtained: '', totalMarks: '', grade: '' });

    const config = {
        headers: { Authorization: `Bearer ${user.token}` },
    };

    useEffect(() => {
        fetchStudents();
        fetchTeacherClass();
        fetchTimetable();
        if (activeTab === 'Homework') fetchHomework();
    }, [activeTab]);

    const fetchTeacherClass = async () => {
        try {
            const { data } = await api.get('/api/classes', config);
            const myClass = data.find(c => c.teacherId?._id === user._id);
            setTeacherClass(myClass);
        } catch (error) {
            console.error("Error fetching teacher class", error);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await api.get(`/api/users?role=Student`, config);
            setStudents(data);
            const initialAttendance = {};
            data.forEach(student => { initialAttendance[student._id] = 'Present'; });
            setAttendance(initialAttendance);
        } catch (error) { console.error("Error fetching students", error); }
    };

    const fetchHomework = async () => {
        try {
            const { data } = await api.get('/api/homework', config);
            setHomeworkList(data);
        } catch (error) { console.error("Error fetching homework", error); }
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
                setSelectedPeriod(todaysPeriods[0].period);
            }
        } catch (error) {
            console.error("Error fetching timetable", error);
        }
    };

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
        } catch (error) { alert('Failed to mark attendance'); }
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
        <div className="container fade-in" style={{ paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>Teacher Dashboard</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Welcome, {user.name}</p>
                </div>
                <button onClick={logout} style={{ color: 'hsl(var(--text-dim))', textDecoration: 'underline' }}>Logout</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button className={`btn ${activeTab === 'Attendance' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Attendance')}>Attendance</button>
                <button className={`btn ${activeTab === 'Homework' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Homework')}>Homework</button>
                <button className={`btn ${activeTab === 'Results' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Results')}>Results</button>
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
                {activeTab === 'Attendance' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <h2>Mark Attendance</h2>
                                <button className="btn btn-secondary" onClick={() => setShowAddForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaUserPlus /> Add Student
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field" style={{ width: 'auto' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: 'hsl(var(--text-dim))' }}>Period:</span>
                                    <select
                                        className="input-field"
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
                            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                                {timetable
                                    .filter(p => p.day === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(selectedDate).getDay()])
                                    .map(p => (
                                        <div
                                            key={p._id}
                                            onClick={() => setSelectedPeriod(p.period)}
                                            style={{
                                                minWidth: '150px',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                background: selectedPeriod === p.period ? 'rgba(50, 200, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                                                border: selectedPeriod === p.period ? '1px solid #32c8ff' : '1px solid transparent',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ fontWeight: 'bold', color: selectedPeriod === p.period ? '#32c8ff' : 'inherit' }}>P{p.period}: {p.subject}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>{p.classId?.className}</div>
                                            <div style={{ fontSize: '0.7rem' }}>{p.startTime} - {p.endTime}</div>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {showAddForm && (
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                <h3 style={{ marginBottom: '15px' }}>Add New Student</h3>
                                <form onSubmit={handleStudentSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                                    <button type="button" onClick={() => setShowAddForm(false)} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                                </form>
                            </div>
                        )}

                        {editingStudent && (
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                <h3 style={{ marginBottom: '15px' }}>Edit Student: {editingStudent.name}</h3>
                                <form onSubmit={handleStudentUpdate}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                                    <button type="button" onClick={() => setEditingStudent(null)} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                                </form>
                            </div>
                        )}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Student Name</th>
                                        <th style={{ textAlign: 'center', padding: '15px' }}>Status</th>
                                        <th style={{ textAlign: 'right', padding: '15px' }}>Actions</th>
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
                                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => setEditingStudent(student)}
                                                    style={{ color: 'hsl(var(--accent))', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    Edit Credentials
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: '30px', textAlign: 'right' }}>
                            <button className="btn btn-primary" onClick={submitAttendance}>Save Attendance</button>
                        </div>
                    </>
                )}

                {activeTab === 'Homework' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
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
                        <form onSubmit={submitResult} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
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
            </div>
        </div>
    );
};

export default TeacherDashboard;
