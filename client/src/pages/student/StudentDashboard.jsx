import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaUserGraduate, FaClipboardList, FaBullhorn, FaBookOpen, FaChartLine } from 'react-icons/fa';

const StudentDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Overview');
    const [attendance, setAttendance] = useState([]);
    const [homework, setHomework] = useState([]);
    const [results, setResults] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [timetable, setTimetable] = useState([]);

    const config = {
        headers: { Authorization: `Bearer ${user.token}` },
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Attendance
                const attRes = await api.get(`/api/attendance/${user._id}`, config);
                setAttendance(attRes.data);

                // Fetch Homework
                const hwRes = await api.get('/api/homework', config);
                setHomework(hwRes.data);

                // Fetch Results
                const resRes = await api.get(`/api/results`, config);
                setResults(resRes.data);

                // Fetch Announcements
                const annRes = await api.get('/api/announcements', config);
                setAnnouncements(annRes.data);

                // Fetch Timetable if student has a class
                if (user.studentClass) {
                    const ttRes = await api.get(`/api/timetable/class/${user.studentClass}`, config);
                    setTimetable(ttRes.data);
                }

            } catch (error) {
                console.error("Error fetching student data", error);
            }
        };

        fetchData();
    }, []);

    const requestRectification = async (date) => {
        const reason = prompt("Enter reason for rectification:");
        if (!reason) return;

        try {
            await api.put('/api/attendance/rectify', { date, reason }, config);
            alert('Rectification requested');
        } catch (error) {
            alert('Error requesting rectification');
        }
    };

    return (
        <div className="container fade-in" style={{ paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>Student Portal</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Welcome, {user.name}</p>
                </div>
                <button onClick={logout} style={{ color: 'hsl(var(--text-dim))', textDecoration: 'underline' }}>Logout</button>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div onClick={() => setActiveTab('Attendance')} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', border: activeTab === 'Attendance' ? '1px solid hsl(var(--primary))' : '' }}>
                    <FaClipboardList size={24} style={{ marginBottom: '10px', color: '#32c8ff' }} />
                    <h3>{attendance.length > 0 ? ((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100).toFixed(1) : 0}%</h3>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>Attendance</p>
                </div>
                <div onClick={() => setActiveTab('Homework')} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', border: activeTab === 'Homework' ? '1px solid hsl(var(--primary))' : '' }}>
                    <FaBookOpen size={24} style={{ marginBottom: '10px', color: '#ffc832' }} />
                    <h3>{homework.length}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>Assignments</p>
                </div>
                <div onClick={() => setActiveTab('Results')} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', border: activeTab === 'Results' ? '1px solid hsl(var(--primary))' : '' }}>
                    <FaChartLine size={24} style={{ marginBottom: '10px', color: '#64ff96' }} />
                    <h3>Results</h3>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>View Performance</p>
                </div>
                <div onClick={() => setActiveTab('Announcements')} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', border: activeTab === 'Announcements' ? '1px solid hsl(var(--primary))' : '' }}>
                    <FaBullhorn size={24} style={{ marginBottom: '10px', color: '#ff6464' }} />
                    <h3>{announcements.length}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>Announcements</p>
                </div>
                <div onClick={() => setActiveTab('Timetable')} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', border: activeTab === 'Timetable' ? '1px solid hsl(var(--primary))' : '' }}>
                    <FaClipboardList size={24} style={{ marginBottom: '10px', color: '#a855f7' }} />
                    <h3>Timetable</h3>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>Weekly Schedule</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="glass-panel" style={{ padding: '30px', minHeight: '400px' }}>
                <h2>{activeTab === 'Overview' ? 'Select a tab above' : activeTab}</h2>
                <div style={{ marginTop: '20px' }}>

                    {activeTab === 'Overview' && <p>Click on any card above to view detailed information.</p>}

                    {activeTab === 'Attendance' && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map(record => (
                                        <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '10px' }}>{new Date(record.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '10px', color: record.status === 'Present' ? '#64ff96' : '#ff6464' }}>{record.status}</td>
                                            <td style={{ padding: '10px' }}>
                                                {record.status !== 'Present' && !record.rectificationRequest?.requested && (
                                                    <button onClick={() => requestRectification(record.date)} style={{ fontSize: '0.8rem', textDecoration: 'underline', color: 'hsl(var(--accent))' }}>Rectify</button>
                                                )}
                                                {record.rectificationRequest?.requested && <span style={{ fontSize: '0.8rem', color: 'orange' }}>Request {record.rectificationRequest.status}</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'Homework' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                            {homework.map(hw => (
                                <div key={hw._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>{hw.subject}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#ff6b6b' }}>Due: {new Date(hw.deadline).toLocaleDateString()}</span>
                                    </div>
                                    <h4 style={{ margin: '10px 0' }}>{hw.title}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>{hw.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'Results' && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid grey' }}>Exam</th>
                                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid grey' }}>Subject</th>
                                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid grey' }}>Marks</th>
                                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid grey' }}>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map(res => (
                                        <tr key={res._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '10px' }}>{res.examName}</td>
                                            <td style={{ padding: '10px' }}>{res.subject}</td>
                                            <td style={{ padding: '10px' }}>{res.marksObtained} / {res.totalMarks}</td>
                                            <td style={{ padding: '10px' }}>{res.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'Announcements' && (
                        <div>
                            {announcements.map(ann => (
                                <div key={ann._id} style={{ borderLeft: '3px solid hsl(var(--accent))', paddingLeft: '15px', marginBottom: '20px' }}>
                                    <h4>{ann.title}</h4>
                                    <p style={{ marginBottom: '5px' }}>{ann.content}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>
                                        Posted by {ann.postedBy?.name} on {new Date(ann.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'Timetable' && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Day</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Time</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Class / Section</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Subject</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Teacher</th>
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
                                                <td style={{ padding: '15px' }}>{entry.isBreak ? 'N/A' : entry.teacherId?.name || 'Assigned soon'}</td>
                                            </tr>
                                        ));
                                    })}
                                    {timetable.length === 0 && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No schedule entries found. Please ask your teacher or admin.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
