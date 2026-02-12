import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaUserTie, FaUserGraduate, FaUserPlus, FaChalkboardTeacher, FaLayerGroup, FaClipboardList, FaBullhorn, FaTrash, FaArrowLeft, FaEye } from 'react-icons/fa';

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
    const [announcements, setAnnouncements] = useState([]);
    const [announcementData, setAnnouncementData] = useState({ title: '', content: '', targetAudience: 'All' });
    const [editId, setEditId] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classAttendance, setClassAttendance] = useState([]);

    // Attendance State
    const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({}); // { teacherId: 'Present' | 'Absent' }
    const [selectedTeacherAttendance, setSelectedTeacherAttendance] = useState(null); // For viewing specific teacher history


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

    const fetchAnnouncements = async () => {
        try {
            const { data } = await api.get('/api/announcements', config);
            setAnnouncements(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchClassAttendance = async (classId) => {
        try {
            const { data } = await api.get(`/api/attendance/class/${classId}`, config);
            setClassAttendance(data);
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
        if (activeTab === 'Teacher Attendance') {
            fetchAttendance();
        }
        if (activeTab === 'Announcements') {
            fetchAnnouncements();
        }
    }, [activeTab]);

    const handleClassSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/api/classes/${editId}`, classData, config);
                alert('Class updated successfully');
            } else {
                await api.post('/api/classes', classData, config);
                alert('Class created successfully');
            }
            closeForm();
            fetchClasses();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving class');
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
            closeForm();
            fetchSubAdmins();
            alert('Sub Admin created successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating Sub Admin');
        }
    };

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/announcements', announcementData, config);
            closeForm();
            fetchAnnouncements();
            alert('Announcement posted successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error posting announcement');
        }
    };

    const handleDeleteClass = async (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await api.delete(`/api/classes/${id}`, config);
                setClasses(classes.filter(c => c._id !== id));
                alert('Class deleted successfully');
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting class');
            }
        }
    };

    const handleDeleteSubAdmin = async (id) => {
        if (window.confirm('Are you sure you want to delete this Sub Admin? This cannot be undone.')) {
            try {
                await api.delete(`/api/users/${id}`, config);
                setSubAdmins(subAdmins.filter(a => a._id !== id));
                alert('Sub Admin deleted successfully');
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting Sub Admin');
            }
        }
    };

    const handleAttendanceChange = (teacherId, status) => {
        setAttendanceData(prev => ({ ...prev, [teacherId]: status }));
    };

    const submitAttendance = async () => {
        const presentIds = Object.keys(attendanceData).filter(id => attendanceData[id] === 'Present');
        const absentIds = Object.keys(attendanceData).filter(id => attendanceData[id] === 'Absent');

        try {
            if (presentIds.length > 0) {
                await api.post('/api/attendance', { userIds: presentIds, date: attendanceDate, status: 'Present' }, config);
            }
            if (absentIds.length > 0) {
                await api.post('/api/attendance', { userIds: absentIds, date: attendanceDate, status: 'Absent' }, config);
            }
            alert('Attendance marked successfully');
            setIsMarkingAttendance(false);
            fetchAttendance();
            // Reset local state
            setAttendanceData({});
        } catch (error) {
            alert(error.response?.data?.message || 'Error marking attendance');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditId(null);
        setClassData({ className: '', teacherId: '', subAdminId: '' });
        setSubAdminData({ name: '', email: '', password: '', role: 'SubAdmin' });
        setIsCreatingTeacher(false);
        setNewTeacherData({ name: '', email: '', password: '', role: 'Teacher' });
        setAnnouncementData({ title: '', content: '', targetAudience: 'All' });
    };

    const handleEditClass = (cls) => {
        setEditId(cls._id);
        setClassData({
            className: cls.className,
            teacherId: cls.teacherId?._id || '',
            subAdminId: cls.subAdminId?._id || ''
        });
        setNewItemType('Class');
        setShowForm(true);
    };

    const handleViewAttendance = (cls) => {
        setSelectedClass(cls);
        fetchClassAttendance(cls._id);
    };

    // Helper to calculate stats
    const getTeacherStats = (teacherId) => {
        const records = attendanceRecords.filter(r => r.userId?._id === teacherId);
        const total = records.length;
        const present = records.filter(r => r.status === 'Present').length;
        const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
        return { total, present, percentage };
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
            {/* Actions */}
            <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
                {['Classes', 'SubAdmins', 'Teacher Attendance', 'Announcements'].map(tab => (
                    <button
                        key={tab}
                        className={`btn ${activeTab === tab ? 'btn-primary' : ''}`}
                        onClick={() => { setActiveTab(tab); setSelectedClass(null); }}
                    >
                        {tab === 'SubAdmins' ? 'Sub Admins' : tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <h2 style={{ color: 'hsl(var(--white))' }}>
                        {selectedClass ? `Attendance: ${selectedClass.className}` : activeTab === 'SubAdmins' ? 'Sub Admin Management' : activeTab === 'Teacher Attendance' ? 'Teacher Attendance' : `${activeTab} Management`}
                    </h2>
                    {activeTab !== 'Teacher Attendance' && !selectedClass && (
                        <button className="btn btn-primary" onClick={() => {
                            setShowForm(true);
                            setNewItemType(activeTab === 'Classes' ? 'Class' : activeTab === 'SubAdmins' ? 'SubAdmin' : 'Announcement');
                        }}>
                            <FaUserPlus style={{ marginRight: '8px' }} /> Add {activeTab === 'Classes' ? 'Class' : activeTab === 'SubAdmins' ? 'Sub Admin' : 'Announcement'}
                        </button>
                    )}
                    {activeTab === 'Teacher Attendance' && !selectedTeacherAttendance && (
                        <button className="btn btn-primary" onClick={() => {
                            setIsMarkingAttendance(true);
                            // Initialize all teachers as Present by default? Or empty?
                            // Let's initialize empty or let user choose.
                            const initialData = {};
                            teachers.forEach(t => initialData[t._id] = 'Present');
                            setAttendanceData(initialData);
                        }}>
                            <FaClipboardList style={{ marginRight: '8px' }} /> Mark Attendance
                        </button>
                    )}
                    {(selectedClass || selectedTeacherAttendance) && (
                        <button className="btn btn-secondary" onClick={() => { setSelectedClass(null); setSelectedTeacherAttendance(null); }}>
                            <FaArrowLeft style={{ marginRight: '5px' }} /> Back
                        </button>
                    )}
                </div>

                {showForm && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>{editId ? 'Edit' : 'Add New'} {newItemType}</h3>

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
                                                <button type="button" className="btn btn-secondary" onClick={() => setIsCreatingTeacher(!isCreatingTeacher)} disabled={!!editId}>
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
                                    <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'} Class</button>
                                    <button type="button" onClick={closeForm} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
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

                        {newItemType === 'Announcement' && (
                            <form onSubmit={handleAnnouncementSubmit}>
                                <input placeholder="Title" className="input-field" value={announcementData.title} onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })} required style={{ marginBottom: '10px' }} />
                                <textarea placeholder="Content" className="input-field" value={announcementData.content} onChange={(e) => setAnnouncementData({ ...announcementData, content: e.target.value })} required style={{ marginBottom: '10px', minHeight: '100px' }} />
                                <select className="input-field" value={announcementData.targetAudience} onChange={(e) => setAnnouncementData({ ...announcementData, targetAudience: e.target.value })} style={{ marginBottom: '10px' }}>
                                    <option value="All">All</option>
                                    <option value="Teachers">Teachers</option>
                                    <option value="Students">Students</option>
                                </select>
                                <button type="submit" className="btn btn-primary">Post Announcement</button>
                                <button type="button" onClick={closeForm} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                            </form>
                        )}
                    </div>
                )}

                {/* Tables */}
                {activeTab === 'Classes' && !selectedClass && (
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
                                    <td style={{ padding: '15px' }}>{cls.subAdminId?.name || <span style={{ opacity: 0.5 }}>Not Assigned</span>}</td>
                                    <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleEditClass(cls)} style={{ color: 'hsl(var(--accent))', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
                                        <button onClick={() => handleDeleteClass(cls._id)} style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash /></button>
                                        <button onClick={() => handleViewAttendance(cls)} style={{ color: '#4CAF50', background: 'none', border: 'none', cursor: 'pointer' }}><FaEye /> View Attendance</button>
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
                                    <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                        <button style={{ color: 'hsl(var(--accent))', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
                                        <button onClick={() => handleDeleteSubAdmin(admin._id)} style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                            {subAdmins.length === 0 && <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No Sub Admins found</td></tr>}
                        </tbody>
                    </table>
                )}

                {activeTab === 'Teacher Attendance' && (
                    <div>
                        {isMarkingAttendance && (
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                <h3 style={{ marginBottom: '15px' }}>Mark Teacher Attendance</h3>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ marginRight: '10px' }}>Date:</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        style={{ display: 'inline-block', width: 'auto' }}
                                        value={attendanceDate}
                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]} // updated: added split to fix format
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                    {teachers.map(teacher => (
                                        <div key={teacher._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{teacher.name}</span>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAttendanceChange(teacher._id, 'Present')}
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '4px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        background: attendanceData[teacher._id] === 'Present' ? '#32c8ff' : 'rgba(255,255,255,0.1)',
                                                        color: attendanceData[teacher._id] === 'Present' ? '#000' : '#fff'
                                                    }}
                                                >
                                                    P
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAttendanceChange(teacher._id, 'Absent')}
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '4px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        background: attendanceData[teacher._id] === 'Absent' ? '#ff6464' : 'rgba(255,255,255,0.1)',
                                                        color: attendanceData[teacher._id] === 'Absent' ? '#fff' : '#fff'
                                                    }}
                                                >
                                                    A
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={submitAttendance} className="btn btn-primary">Save Attendance</button>
                                    <button onClick={() => setIsMarkingAttendance(false)} className="btn btn-secondary" style={{ color: '#ff6b6b' }}>Cancel</button>
                                </div>
                            </div>
                        )}

                        {!isMarkingAttendance && !selectedTeacherAttendance && (
                            <div style={{ overflowX: 'auto' }}>
                                <h3 style={{ marginBottom: '15px', color: 'hsl(var(--text-dim))' }}>Teachers Attendance Summary</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Teacher</th>
                                            <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Attendance (Present/Total)</th>
                                            <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Percentage</th>
                                            <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teachers.map(teacher => {
                                            const stats = getTeacherStats(teacher._id);
                                            return (
                                                <tr key={teacher._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '15px' }}>{teacher.name}</td>
                                                    <td style={{ padding: '15px' }}>{stats.present} / {stats.total}</td>
                                                    <td style={{ padding: '15px' }}>
                                                        <span style={{
                                                            padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem',
                                                            background: stats.percentage >= 75 ? 'rgba(50, 200, 255, 0.2)' : 'rgba(255, 100, 100, 0.2)',
                                                            color: stats.percentage >= 75 ? '#32c8ff' : '#ff6464',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {stats.percentage}%
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <button
                                                            onClick={() => setSelectedTeacherAttendance(teacher)}
                                                            style={{ color: 'hsl(var(--accent))', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                                        >
                                                            View History
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {teachers.length === 0 && <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No teachers found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {selectedTeacherAttendance && (
                            <div style={{ overflowX: 'auto' }}>
                                <h3 style={{ marginBottom: '15px', color: 'hsl(var(--text-dim))' }}>Attendance History: {selectedTeacherAttendance.name}</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Date</th>
                                            <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Status</th>
                                            <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Marked By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceRecords
                                            .filter(r => r.userId?._id === selectedTeacherAttendance._id)
                                            .map(record => (
                                                <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                                                    <td style={{ padding: '15px' }}>Admin</td>
                                                </tr>
                                            ))}
                                        {attendanceRecords.filter(r => r.userId?._id === selectedTeacherAttendance._id).length === 0 &&
                                            <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No attendance records found for this teacher</td></tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Announcements' && (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {announcements.map(ann => (
                            <div key={ann._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0, color: 'hsl(var(--primary))' }}>{ann.title}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{ color: 'hsl(var(--text))', marginBottom: '10px' }}>{ann.content}</p>
                                <span style={{ fontSize: '0.8rem', background: 'rgba(50, 200, 255, 0.2)', padding: '4px 10px', borderRadius: '15px', color: '#32c8ff' }}>
                                    To: {ann.targetAudience}
                                </span>
                            </div>
                        ))}
                        {announcements.length === 0 && <p style={{ textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No announcements found</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
