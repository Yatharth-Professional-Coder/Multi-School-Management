import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaUserCheck, FaUserTimes, FaCalendarAlt, FaBook, FaClipboardList, FaBullhorn } from 'react-icons/fa';

const TeacherDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('Attendance'); // Attendance, Homework, Results

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
        if (activeTab === 'Homework') fetchHomework();
    }, [activeTab]);

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

    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const submitAttendance = async () => {
        const presentIds = Object.keys(attendance).filter(id => attendance[id] === 'Present');
        const absentIds = Object.keys(attendance).filter(id => attendance[id] === 'Absent');
        const lateIds = Object.keys(attendance).filter(id => attendance[id] === 'Late');

        try {
            if (presentIds.length > 0) await api.post('/api/attendance', { userIds: presentIds, date: selectedDate, status: 'Present' }, config);
            if (absentIds.length > 0) await api.post('/api/attendance', { userIds: absentIds, date: selectedDate, status: 'Absent' }, config);
            if (lateIds.length > 0) await api.post('/api/attendance', { userIds: lateIds, date: selectedDate, status: 'Late' }, config);
            alert('Attendance marked successfully!');
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
                            <h2>Mark Attendance</h2>
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field" style={{ width: 'auto' }} />
                        </div>
                        <div style={{ overflowX: 'auto' }}>
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
