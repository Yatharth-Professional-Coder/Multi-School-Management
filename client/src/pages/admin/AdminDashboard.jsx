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
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form States
    const [newItemType, setNewItemType] = useState('Class'); // 'Class', 'SubAdmin'
    const [classData, setClassData] = useState({ className: '', teacherId: '', subAdminId: '' });
    const [subAdminData, setSubAdminData] = useState({ name: '', email: '', password: '', role: 'SubAdmin' });
    const [teacherData, setTeacherData] = useState({ name: '', email: '', password: '', role: 'Teacher' }); // Separate state for direct teacher addition
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

    // Timetable State
    const [timetableEntries, setTimetableEntries] = useState([]);
    const [timetableFormData, setTimetableFormData] = useState({
        classId: '', teacherId: '', subject: '', day: 'Monday', period: 1, startTime: '', endTime: '', isBreak: false
    });
    const [selectedTimetableClass, setSelectedTimetableClass] = useState(null);


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

    const fetchTimetable = async (classId) => {
        try {
            const { data } = await api.get(`/api/timetable/class/${classId}`, config);
            setTimetableEntries(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleTimetableSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...timetableFormData };
            if (payload.isBreak) {
                payload.teacherId = null; // Ensure teacherId is null if it's a break
            }
            await api.post('/api/timetable', payload, config);
            fetchTimetable(timetableFormData.classId);
            setTimetableFormData({ ...timetableFormData, subject: '', period: timetableFormData.period + 1, isBreak: false });
            alert('Timetable entry added');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding timetable entry');
        }
    };

    const handleDeleteTimetable = async (id) => {
        if (window.confirm('Delete this timetable entry?')) {
            try {
                await api.delete(`/api/timetable/${id}`, config);
                setTimetableEntries(timetableEntries.filter(t => t._id !== id));
            } catch (error) {
                alert('Error deleting timetable');
            }
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

    const handleTeacherSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/users', teacherData, config);
            closeForm();
            setTeachers([...teachers, data]);
            alert('Teacher created successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating Teacher');
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

    const handleDeleteTeacher = async (id) => {
        if (window.confirm('Are you sure you want to delete this Teacher? This cannot be undone.')) {
            try {
                await api.delete(`/api/users/${id}`, config);
                setTeachers(teachers.filter(t => t._id !== id));
                alert('Teacher deleted successfully');
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting Teacher');
            }
        }
    };
    const handleUserUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatePayload = {
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role
            };
            if (editingUser.password) {
                updatePayload.password = editingUser.password;
            }
            await api.put(`/api/users/${editingUser._id}`, updatePayload, config);
            setEditingUser(null);

            // Refresh counts/lists
            if (activeTab === 'SubAdmins') fetchSubAdmins();
            if (activeTab === 'Teacher Attendance') fetchTeachers();
            fetchClasses(); // Refresh classes to update teacher names if any changed

            alert('User updated successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating user');
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
        setTeacherData({ name: '', email: '', password: '', role: 'Teacher' });
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
                {['Classes', 'SubAdmins', 'Teacher Attendance', 'Announcements', 'Timetable'].map(tab => (
                    <button
                        key={tab}
                        className={`btn ${activeTab === tab ? 'btn-primary' : ''}`}
                        onClick={() => { setActiveTab(tab); setSelectedClass(null); setSelectedTimetableClass(null); }}
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
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-primary" onClick={() => {
                                setIsMarkingAttendance(true);
                                const initialData = {};
                                teachers.forEach(t => initialData[t._id] = 'Present');
                                setAttendanceData(initialData);
                            }}>
                                <FaClipboardList style={{ marginRight: '8px' }} /> Mark Attendance
                            </button>
                            <button className="btn btn-secondary" onClick={() => {
                                setShowForm(true);
                                setNewItemType('Teacher');
                            }}>
                                <FaUserPlus style={{ marginRight: '8px' }} /> Add Teacher
                            </button>
                        </div>
                    )}
                    {activeTab === 'Timetable' && selectedTimetableClass && (
                        <button className="btn btn-secondary" onClick={() => setSelectedTimetableClass(null)}>
                            <FaArrowLeft style={{ marginRight: '5px' }} /> Back to Classes
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
                                                    <input placeholder="Email / Username" className="input-field" style={{ marginBottom: '10px' }} value={newTeacherData.email} onChange={(e) => setNewTeacherData({ ...newTeacherData, email: e.target.value })} />
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

                        {newItemType === 'Teacher' && (
                            <form onSubmit={handleTeacherSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input
                                        placeholder="Full Name"
                                        className="input-field"
                                        value={teacherData.name}
                                        onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        placeholder="Email / Username"
                                        className="input-field"
                                        value={teacherData.email}
                                        onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Temporary Password"
                                        className="input-field"
                                        value={teacherData.password}
                                        onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Create Teacher</button>
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
                {editingUser && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Edit {editingUser.role}: {editingUser.name}</h3>
                        <form onSubmit={handleUserUpdate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input
                                    placeholder="Full Name"
                                    className="input-field"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Email / Username"
                                    className="input-field"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="New Password (Leave blank to keep current)"
                                    className="input-field"
                                    value={editingUser.password || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                />
                            </div>
                            <div style={{ marginTop: '15px' }}>
                                <button type="submit" className="btn btn-primary">Update User</button>
                                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary" style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}
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
                                        <button
                                            onClick={() => setEditingUser(admin)}
                                            style={{ color: 'hsl(var(--accent))', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            Edit
                                        </button>
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
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button
                                                                onClick={() => setSelectedTeacherAttendance(teacher)}
                                                                style={{ color: 'hsl(var(--accent))', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                                            >
                                                                View History
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingUser(teacher)}
                                                                style={{ color: 'hsl(var(--accent))', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTeacher(teacher._id)}
                                                                style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
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
                {activeTab === 'Timetable' && (
                    <div>
                        {!selectedTimetableClass ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                                {classes.map(cls => (
                                    <div
                                        key={cls._id}
                                        className="glass-panel"
                                        style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.2s' }}
                                        onClick={() => {
                                            setSelectedTimetableClass(cls);
                                            fetchTimetable(cls._id);
                                            setTimetableFormData({ ...timetableFormData, classId: cls._id });
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <h3 style={{ color: 'hsl(var(--primary))' }}>{cls.className}</h3>
                                        <p style={{ color: 'hsl(var(--text-dim))', fontSize: '0.9rem' }}>Manage Schedule</p>
                                    </div>
                                ))}
                                {classes.length === 0 && <p style={{ color: 'hsl(var(--text-dim))' }}>No classes found</p>}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                                {/* Add Entry Form */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
                                    <h3 style={{ marginBottom: '20px' }}>Add Period</h3>
                                    <form onSubmit={handleTimetableSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <select
                                            className="input-field"
                                            value={timetableFormData.day}
                                            onChange={(e) => setTimetableFormData({ ...timetableFormData, day: e.target.value })}
                                        >
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'hsl(var(--text-dim))' }}>
                                            <input
                                                type="checkbox"
                                                id="isBreak"
                                                checked={timetableFormData.isBreak}
                                                onChange={(e) => setTimetableFormData({ ...timetableFormData, isBreak: e.target.checked })}
                                            />
                                            <label htmlFor="isBreak">Mark as Break Time</label>
                                        </div>
                                        <input
                                            placeholder={timetableFormData.isBreak ? "Break Name (e.g., Lunch)" : "Subject"}
                                            className="input-field"
                                            value={timetableFormData.subject}
                                            onChange={(e) => setTimetableFormData({ ...timetableFormData, subject: e.target.value })}
                                            required
                                        />
                                        {!timetableFormData.isBreak && (
                                            <select
                                                className="input-field"
                                                value={timetableFormData.teacherId}
                                                onChange={(e) => setTimetableFormData({ ...timetableFormData, teacherId: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Teacher</option>
                                                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                            </select>
                                        )}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                            <input
                                                type="number"
                                                placeholder="P #"
                                                className="input-field"
                                                value={timetableFormData.period}
                                                onChange={(e) => setTimetableFormData({ ...timetableFormData, period: parseInt(e.target.value) })}
                                                required
                                            />
                                            <input
                                                type="time"
                                                className="input-field"
                                                value={timetableFormData.startTime}
                                                onChange={(e) => setTimetableFormData({ ...timetableFormData, startTime: e.target.value })}
                                                required
                                            />
                                            <input
                                                type="time"
                                                className="input-field"
                                                value={timetableFormData.endTime}
                                                onChange={(e) => setTimetableFormData({ ...timetableFormData, endTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <button className="btn btn-primary" type="submit">Add to Schedule</button>
                                    </form>
                                </div>

                                {/* Current Schedule View */}
                                <div style={{ overflowX: 'auto' }}>
                                    <h3 style={{ marginBottom: '20px' }}>{selectedTimetableClass.className} Schedule</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ textAlign: 'left', padding: '12px' }}>Day</th>
                                                <th style={{ textAlign: 'left', padding: '12px' }}>Period</th>
                                                <th style={{ textAlign: 'left', padding: '12px' }}>Subject</th>
                                                <th style={{ textAlign: 'left', padding: '12px' }}>Teacher</th>
                                                <th style={{ textAlign: 'left', padding: '12px' }}>Time</th>
                                                <th style={{ textAlign: 'left', padding: '12px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {timetableEntries.map(entry => (
                                                <tr key={entry._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '12px' }}>{entry.day}</td>
                                                    <td style={{ padding: '12px' }}>P{entry.period}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        {entry.subject} {entry.isBreak && <span style={{ fontSize: '0.7rem', background: 'rgba(255, 100, 100, 0.2)', color: '#ff6464', padding: '2px 6px', borderRadius: '10px', marginLeft: '5px' }}>Break</span>}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>{entry.isBreak ? 'N/A' : entry.teacherId?.name}</td>
                                                    <td style={{ padding: '12px' }}>{entry.startTime} - {entry.endTime}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <button onClick={() => handleDeleteTimetable(entry._id)} style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {timetableEntries.length === 0 && <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No schedule set</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
