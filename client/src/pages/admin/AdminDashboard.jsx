import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaUserTie, FaUserGraduate, FaUserPlus, FaChalkboardTeacher, FaLayerGroup } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [pendingRectifications, setPendingRectifications] = useState([]);
    const [activeTab, setActiveTab] = useState('Overview');
    const [showForm, setShowForm] = useState(false);
    const [newItemType, setNewItemType] = useState('Teacher'); // 'Teacher', 'Student', 'Class', 'Announcement'

    // Form States
    const [userData, setUserData] = useState({ name: '', email: '', password: '', role: 'Teacher' });
    const [classData, setClassData] = useState({ className: '' });
    const [announcementData, setAnnouncementData] = useState({ title: '', content: '', targetAudience: 'All' });

    const config = {
        headers: { Authorization: `Bearer ${user.token}` },
    };

    const fetchData = async () => {
        try {
            const usersRes = await api.get('/api/users', config);
            setUsers(usersRes.data);

            const classesRes = await api.get('/api/classes', config);
            setClasses(classesRes.data);

            const pendingRes = await api.get('/api/attendance/pending', config);
            setPendingRectifications(pendingRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/users', { ...userData, role: newItemType }, config);
            closeForm();
            fetchData();
            alert(`${newItemType} added successfully`);
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding user');
        }
    };

    const handleClassSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/classes', classData, config);
            closeForm();
            fetchData();
            alert('Class created successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating class');
        }
    };

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/announcements', announcementData, config);
            closeForm();
            alert('Announcement posted successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error posting announcement');
        }
    };

    const handleRectification = async (id, status) => {
        try {
            await api.put('/api/attendance/rectify/approve', { attendanceId: id, status }, config);
            alert(`Request ${status}`);
            fetchData();
        } catch (error) {
            alert(`Error handling request: ${error.response?.data?.message}`);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setUserData({ name: '', email: '', password: '', role: 'Teacher' });
        setClassData({ className: '' });
        setAnnouncementData({ title: '', content: '', targetAudience: 'All' });
    };

    const stats = {
        teachers: users.filter(u => u.role === 'Teacher').length,
        students: users.filter(u => u.role === 'Student').length,
        subAdmins: users.filter(u => u.role === 'SubAdmin').length,
        classes: classes.length,
        rectificationRequests: pendingRectifications.length
    };

    return (
        <div className="container fade-in" style={{ paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>School Dashboard</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Hello, Principal {user.name}</p>
                </div>
                <button onClick={logout} style={{ color: 'hsl(var(--text-dim))', textDecoration: 'underline' }}>Logout</button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ padding: '15px', background: 'rgba(50, 200, 255, 0.2)', borderRadius: '12px', marginRight: '15px' }}>
                        <FaChalkboardTeacher size={24} color="#32c8ff" />
                    </div>
                    <div>
                        <h3>{stats.teachers}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Teachers</p>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ padding: '15px', background: 'rgba(100, 255, 150, 0.2)', borderRadius: '12px', marginRight: '15px' }}>
                        <FaUserGraduate size={24} color="#64ff96" />
                    </div>
                    <div>
                        <h3>{stats.students}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Students</p>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ padding: '15px', background: 'rgba(255, 200, 50, 0.2)', borderRadius: '12px', marginRight: '15px' }}>
                        <FaLayerGroup size={24} color="#ffc832" />
                    </div>
                    <div>
                        <h3>{stats.classes}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Classes</p>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', cursor: 'pointer', border: activeTab === 'Rectifications' ? '1px solid hsl(var(--primary))' : '' }} onClick={() => setActiveTab('Rectifications')}>
                    <div style={{ padding: '15px', background: 'rgba(255, 100, 100, 0.2)', borderRadius: '12px', marginRight: '15px' }}>
                        <FaUserTie size={24} color="#ff6464" />
                    </div>
                    <div>
                        <h3>{stats.rectificationRequests}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Pending Requests</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
                <button className={`btn ${activeTab === 'Teachers' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Teachers')}>Teachers</button>
                <button className={`btn ${activeTab === 'Students' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Students')}>Students</button>
                <button className={`btn ${activeTab === 'Parents' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Parents')}>Parents</button>
                <button className={`btn ${activeTab === 'Classes' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Classes')}>Classes</button>
                <button className={`btn ${activeTab === 'Announcements' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Announcements')}>Announcements</button>
                <button className={`btn ${activeTab === 'Rectifications' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('Rectifications')}>Rectifications</button>
            </div>

            {/* Content Area */}
            <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2>{activeTab} Management</h2>
                    {activeTab !== 'Rectifications' && (
                        <button className="btn btn-primary" onClick={() => {
                            setShowForm(true);
                            setNewItemType(activeTab === 'Classes' ? 'Class' : activeTab === 'Announcements' ? 'Announcement' : activeTab === 'Parents' ? 'Parent' : activeTab === 'Teachers' ? 'Teacher' : 'Student');
                        }}>
                            <FaUserPlus style={{ marginRight: '8px' }} /> Add {activeTab === 'Classes' ? 'Class' : activeTab === 'Announcements' ? 'Announcement' : activeTab === 'Parents' ? 'Parent' : activeTab === 'Teachers' ? 'Teacher' : 'Student'}
                        </button>
                    )}
                </div>

                {showForm && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Create {newItemType}</h3>

                        {newItemType === 'Announcement' ? (
                            <form onSubmit={handleAnnouncementSubmit}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <input placeholder="Title" className="input-field" value={announcementData.title} onChange={e => setAnnouncementData({ ...announcementData, title: e.target.value })} required />
                                    <textarea placeholder="Content" className="input-field" style={{ minHeight: '100px' }} value={announcementData.content} onChange={e => setAnnouncementData({ ...announcementData, content: e.target.value })} required />
                                    <select className="input-field" value={announcementData.targetAudience} onChange={e => setAnnouncementData({ ...announcementData, targetAudience: e.target.value })}>
                                        <option value="All">All</option>
                                        <option value="Teachers">Teachers</option>
                                        <option value="Students">Students</option>
                                        <option value="Parents">Parents</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Post Announcement</button>
                                <button type="button" onClick={closeForm} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                            </form>
                        ) : newItemType === 'Class' ? (
                            <form onSubmit={handleClassSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', maxWidth: '400px' }}>
                                    <input
                                        name="className"
                                        placeholder="Class Name (e.g., Class 10)"
                                        className="input-field"
                                        value={classData.className}
                                        onChange={(e) => setClassData({ ...classData, className: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Create Class</button>
                                <button type="button" onClick={closeForm} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                            </form>
                        ) : newItemType === 'Parent' ? (
                            <form onSubmit={handleUserSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input name="name" placeholder="Parent Name" className="input-field" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} required />
                                    <input name="email" type="email" placeholder="Email Address" className="input-field" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} required />
                                    <input name="password" type="password" placeholder="Temporary Password" className="input-field" value={userData.password} onChange={(e) => setUserData({ ...userData, password: e.target.value })} required />
                                    <select className="input-field" value={userData.childId || ''} onChange={(e) => setUserData({ ...userData, childId: e.target.value })} required>
                                        <option value="">Select Child</option>
                                        {users.filter(u => u.role === 'Student').map(student => (
                                            <option key={student._id} value={student._id}>{student.name} ({student.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Create Parent Account</button>
                                <button type="button" onClick={closeForm} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                            </form>
                        ) : (
                            <form onSubmit={handleUserSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input
                                        name="name"
                                        placeholder="Full Name"
                                        className="input-field"
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="Email Address"
                                        className="input-field"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        required
                                    />
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="Temporary Password"
                                        className="input-field"
                                        value={userData.password}
                                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Save {newItemType}</button>
                                <button type="button" onClick={closeForm} style={{ marginLeft: '10px', color: '#ff6b6b' }}>Cancel</button>
                            </form>
                        )}
                    </div>
                )}

                {activeTab === 'Rectifications' ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ textAlign: 'left', padding: '15px' }}>Student</th>
                                    <th style={{ textAlign: 'left', padding: '15px' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '15px' }}>Current Status</th>
                                    <th style={{ textAlign: 'left', padding: '15px' }}>Reason</th>
                                    <th style={{ textAlign: 'left', padding: '15px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRectifications.map(req => (
                                    <tr key={req._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>{req.userId?.name}</td>
                                        <td style={{ padding: '15px' }}>{new Date(req.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '15px' }}>{req.status}</td>
                                        <td style={{ padding: '15px' }}>{req.rectificationRequest.reason}</td>
                                        <td style={{ padding: '15px' }}>
                                            <button onClick={() => handleRectification(req._id, 'Approved')} style={{ marginRight: '10px', color: '#64ff96', border: '1px solid #64ff96', padding: '5px 10px', borderRadius: '5px' }}>Approve</button>
                                            <button onClick={() => handleRectification(req._id, 'Rejected')} style={{ color: '#ff6b6b', border: '1px solid #ff6b6b', padding: '5px 10px', borderRadius: '5px' }}>Reject</button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingRectifications.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-dim))' }}>No pending requests</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'Classes' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {classes.map(cls => (
                            <div key={cls._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                                <h3>{cls.className}</h3>
                            </div>
                        ))}
                        {classes.length === 0 && <p style={{ color: 'hsl(var(--text-dim))' }}>No classes found.</p>}
                    </div>
                ) : activeTab === 'Announcements' ? (
                    <div style={{ color: 'hsl(var(--text-dim))' }}>
                        <p>Announcement history viewing coming in next update. Currently only posting is supported.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '15px' }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '15px' }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '15px' }}>Role</th>
                                <th style={{ textAlign: 'left', padding: '15px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => (activeTab === 'Overview' ? true : activeTab.includes(u.role))).map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>{user.name}</td>
                                    <td style={{ padding: '15px' }}>{user.email}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem',
                                            background: user.role === 'Teacher' ? 'rgba(50, 200, 255, 0.2)' : 'rgba(100, 255, 150, 0.2)',
                                            color: user.role === 'Teacher' ? '#32c8ff' : '#64ff96'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <button style={{ color: 'hsl(var(--text-dim))' }}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
