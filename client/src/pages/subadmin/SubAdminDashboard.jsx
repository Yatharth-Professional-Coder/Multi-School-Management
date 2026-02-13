import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaUserGraduate, FaUserPlus } from 'react-icons/fa';

const SubAdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [rectifications, setRectifications] = useState([]);
    const [activeTab, setActiveTab] = useState('Students');

    const [showForm, setShowForm] = useState(false);

    // Form State
    const [studentData, setStudentData] = useState({ name: '', email: '', password: '', role: 'Student' });

    const config = {
        headers: { Authorization: `Bearer ${user.token}` },
    };

    const fetchData = async () => {
        try {
            const { data } = await api.get('/api/users?role=Student', config);
            setStudents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAttendance = async () => {
        try {
            const { data } = await api.get('/api/attendance', config);
            setAttendanceRecords(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRectifications = async () => {
        try {
            const { data } = await api.get('/api/attendance/pending', config);
            setRectifications(data);
        } catch (error) {
            console.error("Error fetching rectifications", error);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'Attendance') {
            fetchAttendance();
        } else if (activeTab === 'Rectification Requests') {
            fetchRectifications();
        }
    }, [activeTab]);


    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/users', studentData, config);
            setShowForm(false);
            setStudentData({ name: '', email: '', password: '', role: 'Student' });
            fetchData();
            alert('Student added successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding student');
        }
    };

    const handleRectify = async (attendanceId, status) => {
        try {
            await api.put('/api/attendance/rectify/approve', { attendanceId, status }, config);
            alert(`Request ${status}`);
            fetchRectifications();
        } catch (error) {
            alert('Error updating rectification');
        }
    };


    return (
        <div className="container fade-in" style={{ paddingTop: '20px' }}>

            <div className="flex-mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <div>
                    <h1>Sub Admin Dashboard</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Hello, {user.name}</p>
                </div>
                <button onClick={logout} className="btn btn-danger" style={{ alignSelf: 'flex-start' }}>Logout</button>
            </div>



            {/* Quick Stats */}
            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ padding: '15px', background: 'rgba(100, 255, 150, 0.2)', borderRadius: '12px', marginRight: '15px' }}>
                        <FaUserGraduate size={24} color="#64ff96" />
                    </div>
                    <div>
                        <h3>{students.length}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Students Managed</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', whiteSpace: 'nowrap' }}>
                <button className={`btn ${activeTab === 'Students' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Students')}>Students</button>
                <button className={`btn ${activeTab === 'Attendance' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Attendance')}>Attendance</button>
                <button className={`btn ${activeTab === 'Rectification Requests' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Rectification Requests')}>
                    Rectification Requests {rectifications.length > 0 && <span style={{ background: '#ff6b6b', padding: '2px 6px', borderRadius: '50%', fontSize: '0.7rem' }}>{rectifications.length}</span>}
                </button>
            </div>


            {/* Content Area */}
            <div className="glass-panel" style={{ padding: '20px' }}>
                <div className="flex-mobile-col" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'flex-start', gap: '15px' }}>
                    <h2 style={{ color: 'hsl(var(--white))' }}>{activeTab} Management</h2>
                    {activeTab === 'Students' && (
                        <button className="btn btn-primary w-full-mobile" onClick={() => setShowForm(true)}>
                            <FaUserPlus style={{ marginRight: '8px' }} /> Add Student
                        </button>
                    )}
                </div>


                {showForm && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Add New Student</h3>
                        <form onSubmit={handleStudentSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input
                                    name="name"
                                    placeholder="Full Name"
                                    className="input-field"
                                    value={studentData.name}
                                    onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                                    required
                                />
                                <input
                                    name="email"
                                    placeholder="Email / Username"
                                    className="input-field"
                                    value={studentData.email}
                                    onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                                    required
                                />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Temporary Password"
                                    className="input-field"
                                    value={studentData.password}
                                    onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Add Student</button>
                            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                        </form>
                    </div>
                )}

                {activeTab === 'Students' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        {/* ... existing students table ... */}
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>{student.name}</td>
                                    <td style={{ padding: '15px' }}>{student.email}</td>
                                    <td style={{ padding: '15px' }}>
                                        <button style={{ color: 'hsl(var(--accent))' }}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No students found</td></tr>}
                        </tbody>
                    </table>
                ) : activeTab === 'Attendance' ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Student</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.map(record => (
                                    <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>{record.userId?.name}</td>
                                        <td style={{ padding: '15px' }}>{new Date(record.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem',
                                                background: record.status === 'Present' ? 'rgba(50, 200, 255, 0.2)' : 'rgba(255, 100, 100, 0.2)',
                                                color: record.status === 'Present' ? '#32c8ff' : '#ff6464',
                                                fontWeight: 'bold'
                                            }}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {attendanceRecords.length === 0 && <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No attendance records found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Student</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Date / Period</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Reason</th>
                                    <th style={{ textAlign: 'right', padding: '15px', color: 'hsl(var(--secondary))' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rectifications.map(rect => (
                                    <tr key={rect._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>{rect.userId?.name}</td>
                                        <td style={{ padding: '15px' }}>{new Date(rect.date).toLocaleDateString()} (P{rect.period})</td>
                                        <td style={{ padding: '15px' }}>{rect.rectificationRequest?.reason}</td>
                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                            <button className="btn btn-primary" onClick={() => handleRectify(rect._id, 'Approved')} style={{ fontSize: '0.8rem', padding: '5px 10px', marginRight: '5px' }}>Approve</button>
                                            <button className="btn btn-secondary" onClick={() => handleRectify(rect._id, 'Rejected')} style={{ fontSize: '0.8rem', padding: '5px 10px', color: '#ff6b6b' }}>Reject</button>
                                        </td>
                                    </tr>
                                ))}
                                {rectifications.length === 0 && <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No pending rectification requests</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );

};

export default SubAdminDashboard;
