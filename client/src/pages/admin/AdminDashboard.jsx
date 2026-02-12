import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaUserTie, FaUserGraduate, FaUserPlus, FaChalkboardTeacher, FaLayerGroup, FaClipboardList } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [subAdmins, setSubAdmins] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [activeTab, setActiveTab] = useState('Classes'); // Default to Classes
    const [showForm, setShowForm] = useState(false);

    // Form States
    const [newItemType, setNewItemType] = useState('Class'); // 'Class', 'SubAdmin'
    const [classData, setClassData] = useState({ className: '', teacherId: '', subAdminId: '' });
    const [subAdminData, setSubAdminData] = useState({ name: '', email: '', password: '', role: 'SubAdmin' });

    // Create Teacher Mode inside Class Modal
    const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
    const [newTeacherData, setNewTeacherData] = useState({ name: '', email: '', password: '', role: 'Teacher' });

    const config = {
        headers: { Authorization: `Bearer ${user.token}` },
    };

    const fetchClasses = async () => {
        try {
            const { data } = await api.get('/api/classes', config);
            setClasses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSubAdmins = async () => {
        try {
            const { data } = await api.get('/api/users?role=SubAdmin', config);
            setSubAdmins(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const { data } = await api.get('/api/users?role=Teacher', config);
            setTeachers(data);
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

    useEffect(() => {
        fetchClasses();
        fetchSubAdmins();
        fetchTeachers(); // Need teachers for class assignment
    }, []);

    useEffect(() => {
        if (activeTab === 'Attendance') {
            fetchAttendance();
        }
    }, [activeTab]);

    const handleClassSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/classes', classData, config);
            setShowForm(false);
            setClassData({ className: '', teacherId: '', subAdminId: '' });
            fetchClasses();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating class');
        }
    };

    const handleCreateTeacher = async () => {
        try {
            const { data } = await api.post('/api/users', newTeacherData, config);
            setTeachers([...teachers, data]);
            setClassData({ ...classData, teacherId: data._id }); // Auto-select new teacher
            setIsCreatingTeacher(false);
            setNewTeacherData({ name: '', email: '', password: '', role: 'Teacher' });
            alert('Teacher created and selected successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating teacher');
        }
    };

    const handleSubAdminSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/users', subAdminData, config);
            setShowForm(false);
            setSubAdminData({ name: '', email: '', password: '', role: 'SubAdmin' });
            fetchSubAdmins();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating Sub Admin');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setClassData({ className: '', teacherId: '', subAdminId: '' });
        setSubAdminData({ name: '', email: '', password: '', role: 'SubAdmin' });
        setIsCreatingTeacher(false);
        setNewTeacherData({ name: '', email: '', password: '', role: 'Teacher' });
    };

    return (
        <div className="container fade-in" style={{ paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>Admin Dashboard</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Hello, {user.name}</p>
                </div>
                <button onClick={logout} style={{ color: 'hsl(var(--accent))', textDecoration: 'underline' }}>Logout</button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ padding: '15px', background: 'rgba(50, 200, 255, 0.2)', borderRadius: '12px', marginRight: '15px' }}>
                        <FaChalkboardTeacher size={24} color="#32c8ff" />
                    </div>
                    <div>
                        <h3>{teachers.length}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Teachers</p>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ padding: '15px', background: 'rgba(100, 255, 150, 0.2)', borderRadius: '12px', marginRight: '15px' }}>
                        <FaUserTie size={24} color="#64ff96" />
                    </div>
                    <div>
                        <h3>{subAdmins.length}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Sub Admins</p>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ padding: '15px', background: 'rgba(255, 200, 50, 0.2)', borderRadius: '12px', marginRight: '15px' }}>
                        <FaLayerGroup size={24} color="#ffc832" />
                    </div>
                    <div>
                        <h3>{classes.length}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Classes</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
                {['Classes', 'SubAdmins', 'Attendance'].map(tab => (
                    <button
                        key={tab}
                        className={`btn ${activeTab === tab ? 'btn-primary' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'SubAdmins' ? 'Sub Admins' : tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ color: 'hsl(var(--white))' }}>
                        {activeTab === 'SubAdmins' ? 'Sub Admin' : activeTab} Management
                    </h2>
                    {activeTab !== 'Attendance' && (
                        <button className="btn btn-primary" onClick={() => {
                            setShowForm(true);
                            setNewItemType(activeTab === 'Classes' ? 'Class' : 'SubAdmin');
                        }}>
                            <FaUserPlus style={{ marginRight: '8px' }} /> Add {activeTab === 'Classes' ? 'Class' : 'Sub Admin'}
                        </button>
                    )}
                </div>

                {showForm && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Add New {newItemType}</h3>

                        {newItemType === 'Class' && (
                            <form onSubmit={handleClassSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                    <input
                                        placeholder="Class Name (e.g., Class 10-A)"
                                        className="input-field"
                                        value={classData.className}
                                        onChange={(e) => setClassData({ ...classData, className: e.target.value })}
                                        required
                                    />

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px' }}>Class Teacher</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <select
                                                    className="input-field"
                                                    value={classData.teacherId}
                                                    onChange={(e) => setClassData({ ...classData, teacherId: e.target.value })}
                                                    disabled={isCreatingTeacher}
                                                >
                                                    <option value="">Select Teacher</option>
                                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                                </select>
                                                <button type="button" className="btn btn-secondary" onClick={() => setIsCreatingTeacher(!isCreatingTeacher)}>
                                                    {isCreatingTeacher ? 'Select Existing' : 'Create New'}
                                                </button>
                                            </div>

                                            {isCreatingTeacher && (
                                                <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                                    <input placeholder="Teacher Name" className="input-field" style={{ marginBottom: '10px' }} value={newTeacherData.name} onChange={(e) => setNewTeacherData({ ...newTeacherData, name: e.target.value })} />
                                                    <input placeholder="Email" className="input-field" style={{ marginBottom: '10px' }} value={newTeacherData.email} onChange={(e) => setNewTeacherData({ ...newTeacherData, email: e.target.value })} />
                                                    <input placeholder="Password" type="password" className="input-field" style={{ marginBottom: '10px' }} value={newTeacherData.password} onChange={(e) => setNewTeacherData({ ...newTeacherData, password: e.target.value })} />
                                                    <button type="button" className="btn btn-primary" onClick={handleCreateTeacher}>Save & Select Teacher</button>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px' }}>Assign Sub Admin</label>
                                            <select
                                                className="input-field"
                                                value={classData.subAdminId}
                                                onChange={(e) => setClassData({ ...classData, subAdminId: e.target.value })}
                                            >
                                                <option value="">Select Sub Admin</option>
                                                {subAdmins.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <button type="submit" className="btn btn-primary">Create Class</button>
                                    <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                                </div>
                            </form>
                        )}

                        {newItemType === 'SubAdmin' && (
                            <form onSubmit={handleSubAdminSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input
                                        placeholder="Full Name"
                                        className="input-field"
                                        value={subAdminData.name}
                                        onChange={(e) => setSubAdminData({ ...subAdminData, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="input-field"
                                        value={subAdminData.email}
                                        onChange={(e) => setSubAdminData({ ...subAdminData, email: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Temporary Password"
                                        className="input-field"
                                        value={subAdminData.password}
                                        onChange={(e) => setSubAdminData({ ...subAdminData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Create Sub Admin</button>
                                <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                            </form>
                        )}
                    </div>
                )}

                {/* Tables */}
                {activeTab === 'Classes' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Class Name</th>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Class Teacher</th>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Sub Admin</th>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map(cls => (
                                <tr key={cls._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>{cls.className}</td>
                                    <td style={{ padding: '15px' }}>{cls.teacherId?.name || <span style={{ opacity: 0.5 }}>Not Assigned</span>}</td>
                                    <td style={{ padding: '15px' }}>{cls.subAdminId?.name || <span style={{ opacity: 0.5 }}>Not Assigned</span>}</td>
                                    <td style={{ padding: '15px' }}>
                                        <button style={{ color: 'hsl(var(--accent))' }}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {classes.length === 0 && <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No classes found</td></tr>}
                        </tbody>
                    </table>
                )}

                {activeTab === 'SubAdmins' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subAdmins.map(admin => (
                                <tr key={admin._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>{admin.name}</td>
                                    <td style={{ padding: '15px' }}>{admin.email}</td>
                                    <td style={{ padding: '15px' }}>
                                        <button style={{ color: 'hsl(var(--accent))' }}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {subAdmins.length === 0 && <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No Sub Admins found</td></tr>}
                        </tbody>
                    </table>
                )}

                {activeTab === 'Attendance' && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Person</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Role</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.map(record => (
                                    <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>{record.userId?.name}</td>
                                        <td style={{ padding: '15px' }}>{record.userId?.role}</td>
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
                                {attendanceRecords.length === 0 && <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No attendance records found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
